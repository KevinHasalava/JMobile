const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Store online users
const onlineUsers = new Map();

const setupSocket = (io) => {
  // Authentication middleware — allow guests (no token) through
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        // Guest connection — no user attached
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        socket.user = null;
        return next();
      }

      socket.user = user;
      next();
    } catch (error) {
      // Invalid token — allow as guest rather than rejecting
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    if (!socket.user) {
      // Guest — no rooms to join, but connection is valid
      console.log('👤 Guest socket connected:', socket.id);
      return;
    }

    console.log(`✅ User connected: ${socket.user.name} (${socket.user._id})`);

    // Add user to online users
    onlineUsers.set(socket.user._id.toString(), socket.id);

    // Join user's personal room
    socket.join(socket.user._id.toString());

    // If admin, join admin room
    if (socket.user.role === 'admin') {
      socket.join('admin-room');
    }

    // Emit online users to admins
    io.to('admin-room').emit('onlineUsers', Array.from(onlineUsers.keys()));


    // Handle join conversation
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
      console.log(`User ${socket.user.name} joined conversation ${conversationId}`);
    });

    // Handle send message
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content, messageType, imageUrl } = data;

        // Find conversation
        const conversation = await Conversation.findById(conversationId)
          .populate('customer', 'name email');

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check authorization
        const isAdmin = socket.user.role === 'admin';
        const isCustomer = conversation.customer._id.toString() === socket.user._id.toString();

        if (!isAdmin && !isCustomer) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Create message
        const message = await Message.create({
          conversationId,
          sender: socket.user._id,
          senderModel: isAdmin ? 'Admin' : 'User',
          content,
          messageType: messageType || 'text',
          imageUrl
        });

        // Update conversation
        conversation.lastMessage = content.substring(0, 100);
        conversation.lastMessageAt = Date.now();
        
        // Increment unread count for recipient
        if (isAdmin) {
          conversation.unreadCount.customer += 1;
        } else {
          conversation.unreadCount.admin += 1;
        }
        
        await conversation.save();

        // Populate sender info
        await message.populate('sender', 'name email');

        // Emit to conversation room
        io.to(`conversation-${conversationId}`).emit('newMessage', message);

        // Send notification to recipient
        if (isAdmin) {
          // Notify customer
          io.to(conversation.customer._id.toString()).emit('messageNotification', {
            conversationId,
            message: message,
            from: 'Admin'
          });
        } else {
          // Notify all admins
          io.to('admin-room').emit('messageNotification', {
            conversationId,
            message: message,
            from: socket.user.name,
            customer: conversation.customer
          });
        }

        // Update conversation list for admins
        io.to('admin-room').emit('conversationUpdated', conversation);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      
      if (socket.user.role === 'admin') {
        // Notify customer
        socket.to(`conversation-${conversationId}`).emit('userTyping', {
          userId: socket.user._id,
          userName: 'Admin',
          isTyping
        });
      } else {
        // Notify admins
        io.to('admin-room').emit('userTyping', {
          conversationId,
          userId: socket.user._id,
          userName: socket.user.name,
          isTyping
        });
      }
    });

    // Handle mark as read
    socket.on('markAsRead', async (data) => {
      try {
        const { conversationId } = data;
        const isAdmin = socket.user.role === 'admin';

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          return;
        }

        // Mark messages as read
        const senderModel = isAdmin ? 'User' : 'Admin';
        
        await Message.updateMany(
          {
            conversationId,
            senderModel,
            isRead: false
          },
          {
            $set: {
              isRead: true,
              readAt: new Date()
            }
          }
        );

        // Reset unread count
        if (isAdmin) {
          conversation.unreadCount.admin = 0;
        } else {
          conversation.unreadCount.customer = 0;
        }
        
        await conversation.save();

        // Notify about read status
        io.to(`conversation-${conversationId}`).emit('messagesRead', {
          conversationId,
          readBy: socket.user._id
        });

      } catch (error) {
        console.error('Error marking as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
      onlineUsers.delete(socket.user._id.toString());
      
      // Update online users for admins
      io.to('admin-room').emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = setupSocket;

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get or create conversation
// @route   POST /api/chat/conversation
// @access  Private
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ customer: customerId })
      .populate('customer', 'name email');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        customer: customerId
      });
      
      conversation = await Conversation.findById(conversation._id)
        .populate('customer', 'name email');
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations (Admin only)
// @route   GET /api/chat/conversations
// @access  Private/Admin
exports.getAllConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find()
      .populate('customer', 'name email')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation messages
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && conversation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/chat/message
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, messageType, imageUrl } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    // Find conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCustomer = conversation.customer.toString() === req.user._id.toString();

    if (!isAdmin && !isCustomer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
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

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/messages/read/:conversationId
// @access  Private
exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const isAdmin = req.user.role === 'admin';

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Mark all unread messages as read
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

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/chat/unread
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    let unreadCount = 0;

    if (isAdmin) {
      // Sum all admin unread counts
      const conversations = await Conversation.find();
      unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount.admin, 0);
    } else {
      // Get customer's conversation unread count
      const conversation = await Conversation.findOne({ customer: req.user._id });
      unreadCount = conversation ? conversation.unreadCount.customer : 0;
    }

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close conversation (Admin only)
// @route   PUT /api/chat/conversation/:id/close
// @access  Private/Admin
exports.closeConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.status = 'closed';
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation closed',
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

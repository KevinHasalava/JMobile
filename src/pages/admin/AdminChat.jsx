import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';

const AdminChat = () => {
  const { socket, connected, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchConversations(); }, []); // fetchConversations omitted intentionally

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (message) => {
      if (selectedConversation && message.conversationId === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
        socket.emit('markAsRead', { conversationId: selectedConversation._id });
      }
      fetchConversations(); // Update conversation list
    });

    socket.on('messageNotification', (data) => {
      fetchConversations(); // Refresh to show unread count
    });

    socket.on('conversationUpdated', (conversation) => {
      setConversations(prev => 
        prev.map(conv => conv._id === conversation._id ? conversation : conv)
      );
    });

    socket.on('userTyping', (data) => {
      if (data.conversationId === selectedConversation?._id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.isTyping
        }));
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('messageNotification');
      socket.off('conversationUpdated');
      socket.off('userTyping');
    };
  }, [socket, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);
      setMessages(response.data.data);
      
      if (socket) {
        socket.emit('joinConversation', conversationId);
        socket.emit('markAsRead', { conversationId });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !imageFile) || !selectedConversation || !socket) return;

    let imageUrl = null;

    if (imageFile) {
      const formData = new FormData();
      formData.append('images', imageFile);

      try {
        const uploadResponse = await api.post(
          '/upload/product',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (uploadResponse.data.data.images && uploadResponse.data.data.images.length > 0) {
          imageUrl = `${process.env.REACT_APP_BACKEND_URL}${uploadResponse.data.data.images[0].path}`;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
        return;
      }
    }

    const messageData = {
      conversationId: selectedConversation._id,
      content: newMessage.trim() || '📷 Image',
      messageType: imageUrl ? 'image' : 'text',
      imageUrl
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
    setImageFile(null);
    setImagePreview(null);
    setShowEmojiPicker(false);
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation) return;

    socket.emit('typing', { conversationId: selectedConversation._id, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: selectedConversation._id, isTyping: false });
    }, 1000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId.toString());
  };

  if (loading || !socket) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-muted font-medium animate-pulse">Initializing Secure Chat Connection...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Customer Chat</h2>
            <p className="text-text-muted">Manage customer conversations</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-text-secondary text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 h-full">
          {/* Conversations List */}
          <div className="col-span-1 bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-dark-border">
              <h3 className="text-text-primary font-semibold">Conversations ({conversations.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center text-text-muted py-8">
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations?.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 border-b border-dark-border hover:bg-dark-bg transition-colors text-left ${
                      selectedConversation?._id === conv._id ? 'bg-dark-bg' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isUserOnline(conv.customer._id) ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className="text-text-primary font-medium">{conv.customer.name}</span>
                      </div>
                      {conv.unreadCount.admin > 0 && (
                        <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {conv.unreadCount.admin}
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted text-sm truncate">{conv.lastMessage || 'No messages'}</p>
                    <p className="text-text-muted text-xs mt-1">
                      {new Date(conv.lastMessageAt).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-2 bg-dark-card border border-dark-border rounded-xl flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-dark-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-orange rounded-full flex items-center justify-center text-white font-bold">
                      {selectedConversation.customer.name[0]}
                    </div>
                    <div>
                      <h3 className="text-text-primary font-semibold">{selectedConversation.customer.name}</h3>
                      <p className="text-text-muted text-sm">{selectedConversation.customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUserOnline(selectedConversation.customer._id) && (
                      <span className="text-green-500 text-sm">● Online</span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-bg">
                  {messages.length === 0 ? (
                    <div className="text-center text-text-muted py-8">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messages?.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderModel === 'Admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${msg.senderModel === 'Admin' ? 'bg-gradient-orange text-white' : 'bg-dark-card text-text-primary'} rounded-lg p-3 shadow`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="attachment" className="rounded mb-2 max-w-full" />
                          )}
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.senderModel === 'Admin' ? 'text-white/70' : 'text-text-muted'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.isRead && msg.senderModel === 'Admin' && ' ✓✓'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {Object.values(typingUsers).some(v => v) && (
                    <div className="flex justify-start">
                      <div className="bg-dark-card rounded-lg p-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-dark-border p-4 space-y-2">
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="preview" className="h-20 rounded border border-dark-border" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 right-4">
                      <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="adminChatImage"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label htmlFor="adminChatImage" className="cursor-pointer text-text-muted hover:text-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </label>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-text-muted hover:text-primary text-xl"
                    >
                      😊
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                      disabled={!connected}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={(!newMessage.trim() && !imageFile) || !connected}
                      className="bg-gradient-orange text-white px-6 py-2 rounded-lg hover:shadow-glow-orange transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;

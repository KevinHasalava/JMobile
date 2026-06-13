"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import EmojiPicker from 'emoji-picker-react';

const ChatWidget = () => {
  const { user, token } = useAuth();
  const { socket, connected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch or create conversation
  useEffect(() => {
    if (user && token && isOpen && !conversation) {
      fetchConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, isOpen]); // fetchConversation and conversation omitted intentionally

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversation) return;

    socket.emit('joinConversation', conversation._id);

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      setUnreadCount(0);

      // Mark as read if chat is open
      if (isOpen && !minimized) {
        socket.emit('markAsRead', { conversationId: conversation._id });
      }
    });

    socket.on('userTyping', (data) => {
      if (data.userName === 'Admin') {
        setIsTyping(data.isTyping);
      }
    });

    socket.on('messageNotification', (data) => {
      if (!isOpen || minimized) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageNotification');
    };
  }, [socket, conversation, isOpen, minimized]);

  async function fetchConversation() {
    try {
      setLoading(true);
      const response = await axios.post(
        `\${process.env.REACT_APP_API_URL}/chat/conversation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversation(response.data.data);
      fetchMessages(response.data.data._id);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/chat/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.data);

      // Mark as read
      if (socket) {
        socket.emit('markAsRead', { conversationId });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !imageFile) || !conversation || !socket) return;

    let imageUrl = null;

    // Upload image if present
    if (imageFile) {
      const formData = new FormData();
      formData.append('images', imageFile);

      try {
        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/upload/product`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (uploadResponse.data.data.images && uploadResponse.data.data.images.length > 0) {
          imageUrl = `${process.env.REACT_APP_BACKEND_URL}${uploadResponse.data.data.images[0].path}`;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        return;
      }
    }

    const messageData = {
      conversationId: conversation._id,
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
    if (!socket || !conversation) return;

    socket.emit('typing', { conversationId: conversation._id, isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: conversation._id, isTyping: false });
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setMinimized(false);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-gradient-orange text-white p-4 rounded-full shadow-glow-orange hover:scale-110 transition-transform z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 flex flex-col ${minimized ? 'h-14' : 'h-[32rem]'} transition-all`}>
          {/* Header */}
          <div className="bg-gradient-orange p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-white font-semibold">Chat with Admin</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMinimized(!minimized)}
                className="text-white hover:bg-white/20 p-1 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={minimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-white/20 p-1 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-bg">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-text-muted py-8">
                    <p>Start a conversation with our team!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${msg.sender._id === user._id ? 'bg-gradient-orange text-white' : 'bg-dark-card text-text-primary'} rounded-lg p-3 shadow`}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="attachment" className="rounded mb-2 max-w-full" />
                        )}
                        <p className="text-sm break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender._id === user._id ? 'text-white/70' : 'text-text-muted'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
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
              <div className="border-t border-dark-border p-3 space-y-2">
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
                    id="chatImage"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label htmlFor="chatImage" className="cursor-pointer text-text-muted hover:text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-text-muted hover:text-primary"
                  >
                    😊
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                    disabled={!connected}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && !imageFile) || !connected}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

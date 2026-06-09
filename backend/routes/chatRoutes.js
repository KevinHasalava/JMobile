const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getAllConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  closeConversation
} = require('../controllers/chatController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/conversation', getOrCreateConversation);
router.get('/messages/:conversationId', getMessages);
router.post('/message', sendMessage);
router.put('/messages/read/:conversationId', markMessagesAsRead);
router.get('/unread', getUnreadCount);

// Admin routes
router.get('/conversations', admin, getAllConversations);
router.put('/conversation/:id/close', admin, closeConversation);

module.exports = router;

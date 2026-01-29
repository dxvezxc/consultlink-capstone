const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getConsultationMessages,
  getUnreadCount,
  deleteMessage,
  markMessageAsRead,
  getChatStatus
} = require('../controller/messageController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send a message
router.post('/send', sendMessage);

// Get all messages for a consultation
router.get('/consultation/:consultationId', getConsultationMessages);

// Get unread message count for a consultation
router.get('/unread/:consultationId', getUnreadCount);

// Get chat status for a consultation
router.get('/status/:consultationId', getChatStatus);

// Mark message as read
router.put('/:messageId/read', markMessageAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

module.exports = router;

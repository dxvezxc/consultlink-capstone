const Message = require('../models/Message');
const Appointment = require('../models/Appointment');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { appointmentId, receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    // Validate appointment exists and user is part of it
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if sender and receiver are part of the appointment
    const isValidParticipant = 
      (appointment.student.toString() === senderId.toString() || 
       appointment.teacher.toString() === senderId.toString()) &&
      (appointment.student.toString() === receiverId.toString() || 
       appointment.teacher.toString() === receiverId.toString());

    if (!isValidParticipant) {
      return res.status(403).json({ message: 'Not authorized to send message in this appointment' });
    }

    // Check if appointment is confirmed or completed
    if (!['confirmed', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Messages can only be sent for confirmed or completed appointments' });
    }

    // Create message
    const message = new Message({
      appointment: appointmentId,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType
    });

    await message.save();
    await message.populate('sender', 'name email');
    await message.populate('receiver', 'name email');

    res.status(201).json({
      success: true,
      message: message,
      msg: 'Message sent successfully'
    });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

// Get all messages for an appointment
const getConsultationMessages = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of the appointment
    const appointment = await Appointment.findById(consultationId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isParticipant = 
      appointment.student.toString() === userId.toString() || 
      appointment.teacher.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view messages' });
    }

    // Get all messages
    const messages = await Message.find({ appointment: consultationId })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read for current user
    await Message.updateMany(
      { 
        appointment: consultationId, 
        receiver: userId,
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages
    });
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      appointment: consultationId,
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount: unreadCount
    });
  } catch (err) {
    console.error('Get unread count error:', err.message);
    res.status(500).json({ message: 'Error fetching unread count', error: err.message });
  }
};

// Delete a message (only by sender or admin)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    console.error('Delete message error:', err.message);
    res.status(500).json({ message: 'Error deleting message', error: err.message });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: message
    });
  } catch (err) {
    console.error('Mark as read error:', err.message);
    res.status(500).json({ message: 'Error updating message', error: err.message });
  }
};

// Get consultation chat status
const getChatStatus = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(consultationId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isParticipant = 
      appointment.student.toString() === userId.toString() || 
      appointment.teacher.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Chat is enabled when appointment is confirmed
    const chatEnabled = appointment.status === 'confirmed' || appointment.status === 'completed';

    res.status(200).json({
      success: true,
      chatEnabled: chatEnabled,
      appointmentStatus: appointment.status,
      scheduledDate: appointment.dateTime,
      meetingLink: appointment.meetingLink
    });
  } catch (err) {
    console.error('Get chat status error:', err.message);
    res.status(500).json({ message: 'Error fetching chat status', error: err.message });
  }
};

module.exports = {
  sendMessage,
  getConsultationMessages,
  getUnreadCount,
  deleteMessage,
  markMessageAsRead,
  getChatStatus
};

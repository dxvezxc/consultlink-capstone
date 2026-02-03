const Message = require('../models/Message');
const Appointment = require('../models/Appointment');

// Helper function to check if messaging is allowed
const isMessagingAllowed = (appointment) => {
  const now = new Date();
  const appointmentStart = new Date(appointment.dateTime);
  const slotDuration = appointment.slotDuration || 30; // Default 30 minutes
  const appointmentEnd = new Date(appointmentStart.getTime() + slotDuration * 60000);

  // Can only message during the appointment window
  return now >= appointmentStart && now <= appointmentEnd;
};

// Helper function to get messaging window info
const getMessagingWindowInfo = (appointment) => {
  const now = new Date();
  const appointmentStart = new Date(appointment.dateTime);
  const slotDuration = appointment.slotDuration || 30;
  const appointmentEnd = new Date(appointmentStart.getTime() + slotDuration * 60000);

  return {
    appointmentStart,
    appointmentEnd,
    slotDuration,
    status: appointment.status,
    isCompleted: appointment.status === 'completed',
    isCanceled: appointment.status === 'canceled',
    isConfirmed: appointment.status === 'confirmed',
    canMessage: appointment.status === 'confirmed' && now >= appointmentStart && now <= appointmentEnd,
    messageUntil: appointmentEnd,
    messageStartsAt: appointmentStart
  };
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { appointmentId, receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    // Validate appointment exists and user is part of it
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Check if sender and receiver are part of the appointment
    const isValidParticipant = 
      (appointment.student.toString() === senderId.toString() || 
       appointment.teacher.toString() === senderId.toString()) &&
      (appointment.student.toString() === receiverId.toString() || 
       appointment.teacher.toString() === receiverId.toString());

    if (!isValidParticipant) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to send message in this appointment' 
      });
    }

    // Check if appointment is confirmed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false,
        message: 'Messages can only be sent for confirmed appointments',
        windowInfo: getMessagingWindowInfo(appointment)
      });
    }

    // Check if appointment is completed
    if (appointment.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'This consultation has been completed. Messaging is no longer available.',
        windowInfo: getMessagingWindowInfo(appointment)
      });
    }

    // Check if messaging is within the appointment time window
    if (!isMessagingAllowed(appointment)) {
      const windowInfo = getMessagingWindowInfo(appointment);
      const now = new Date();
      
      if (now < windowInfo.appointmentStart) {
        return res.status(400).json({ 
          success: false,
          message: 'Messaging will be available during your appointment time',
          windowInfo: windowInfo,
          timeUntilStart: Math.ceil((windowInfo.appointmentStart - now) / 1000)
        });
      } else {
        return res.status(400).json({ 
          success: false,
          message: 'The appointment time has ended. Messaging is no longer available.',
          windowInfo: windowInfo
        });
      }
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
      msg: 'Message sent successfully',
      windowInfo: getMessagingWindowInfo(appointment)
    });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Error sending message', 
      error: err.message 
    });
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
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    const isParticipant = 
      appointment.student.toString() === userId.toString() || 
      appointment.teacher.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    const windowInfo = getMessagingWindowInfo(appointment);

    res.status(200).json({
      success: true,
      windowInfo: windowInfo,
      appointmentStatus: appointment.status,
      slotDuration: appointment.slotDuration || 30,
      scheduledDate: appointment.dateTime,
      completedAt: appointment.completedAt,
      canceledAt: appointment.canceledAt,
      confirmedAt: appointment.confirmedAt
    });
  } catch (err) {
    console.error('Get chat status error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching chat status', 
      error: err.message 
    });
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

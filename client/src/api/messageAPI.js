import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/messages';
const CONSULTATION_API_URL = 'http://localhost:5000/api/consultations';

// Get all messages for a consultation
export const getMessages = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/consultation/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (appointmentId, receiverId, content, messageType = 'text') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send`, {
      appointmentId,
      receiverId,
      content,
      messageType
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get unread message count for a consultation
export const getUnreadCount = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/unread/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Get chat status for a consultation
export const getChatStatus = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/status/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat status:', error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${messageId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${messageId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Get consultation details
export const getConsultation = async (consultationId) => {
  try {
    const response = await axios.get(`${CONSULTATION_API_URL}/${consultationId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching consultation:', error);
    throw error;
  }
};

// Approve consultation (enables chat)
export const approveConsultation = async (consultationId, meetingLink) => {
  try {
    const response = await axios.put(`${CONSULTATION_API_URL}/${consultationId}/approve`, {
      meetingLink
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error approving consultation:', error);
    throw error;
  }
};

// Reject consultation
export const rejectConsultation = async (consultationId, reason) => {
  try {
    const response = await axios.put(`${CONSULTATION_API_URL}/${consultationId}/reject`, {
      reason
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting consultation:', error);
    throw error;
  }
};

// Complete consultation
export const completeConsultation = async (consultationId) => {
  try {
    const response = await axios.put(`${CONSULTATION_API_URL}/${consultationId}/complete`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error completing consultation:', error);
    throw error;
  }
};

// Submit consultation feedback
export const submitFeedback = async (consultationId, rating, feedback) => {
  try {
    const response = await axios.put(`${CONSULTATION_API_URL}/${consultationId}/feedback`, {
      rating,
      feedback
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

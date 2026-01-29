import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Phone, Video, MoreVertical, Trash2, Loader } from 'lucide-react';
import { getMessages, sendMessage, deleteMessage, getChatStatus, getConsultation } from '../../api/messageAPI';
import './consultationChat.css';

const ConsultationChat = () => {
  const { consultationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user._id);
    }
  }, []);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get consultation details
        const consultRes = await getConsultation(consultationId);
        setConsultation(consultRes.consultation);

        // Get chat status
        const statusRes = await getChatStatus(consultationId);
        setChatEnabled(statusRes.chatEnabled);

        // Get messages
        if (statusRes.chatEnabled) {
          const messagesRes = await getMessages(consultationId);
          setMessages(messagesRes.messages || []);
        }
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    if (consultationId && currentUserId) {
      fetchChatData();
      // Refresh messages every 5 seconds
      const interval = setInterval(fetchChatData, 5000);
      return () => clearInterval(interval);
    }
  }, [consultationId, currentUserId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatEnabled) return;

    try {
      setSending(true);
      const receiverId = consultation.student._id === currentUserId 
        ? consultation.teacher._id 
        : consultation.student._id;

      await sendMessage(consultationId, receiverId, newMessage);
      setNewMessage('');
      
      // Refresh messages
      const messagesRes = await getMessages(consultationId);
      setMessages(messagesRes.messages || []);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      try {
        await deleteMessage(messageId);
        setMessages(messages.filter(msg => msg._id !== messageId));
      } catch (err) {
        console.error('Error deleting message:', err);
        setError('Failed to delete message');
      }
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <Loader className="spinner" />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chatEnabled) {
    return (
      <div className="chat-container">
        <div className="chat-disabled">
          <div className="disabled-message">
            <h3>Chat Not Available</h3>
            <p>
              {consultation?.status === 'pending' 
                ? 'Waiting for teacher to approve this consultation...' 
                : 'This consultation has not been approved yet.'}
            </p>
            <p className="status-badge">{consultation?.status}</p>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipant = consultation.student._id === currentUserId 
    ? consultation.teacher 
    : consultation.student;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h3>{otherParticipant?.name || 'Participant'}</h3>
          <p className="subject-name">{consultation?.subject?.name}</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" title="Call - Coming Soon">
            <Phone size={20} />
          </button>
          <button className="action-btn" title="Video Call - Coming Soon">
            <Video size={20} />
          </button>
          <button className="action-btn" title="More options">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.sender._id === currentUserId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                {message.isRead && message.sender._id === currentUserId && (
                  <span className="read-indicator">✓✓</span>
                )}
              </div>
              <div className="message-meta">
                <span className="timestamp">
                  {new Date(message.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
                {message.sender._id === currentUserId && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMessage(message._id)}
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="send-btn"
        >
          {sending ? <Loader size={20} className="spinner" /> : <Send size={20} />}
        </button>
      </form>

      {error && <div className="chat-error">{error}</div>}

      {/* Coming soon banner for video call */}
      <div className="coming-soon-banner">
        <p>📹 Video call feature coming soon!</p>
      </div>
    </div>
  );
};

export default ConsultationChat;

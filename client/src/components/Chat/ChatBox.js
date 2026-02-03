import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader, Clock, AlertCircle } from 'lucide-react';
import { getMessages, sendMessage, getChatStatus } from '../../api/messageAPI';
import { useAuth } from '../../context/AuthContext';
import '../../styles/chatbox.css';

const ChatBox = ({ appointment, otherUser, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [windowInfo, setWindowInfo] = useState(null);
  const [canMessage, setCanMessage] = useState(false);
  const [messageReason, setMessageReason] = useState('');
  const messagesEndRef = useRef(null);
  const windowCheckInterval = useRef(null);

  // Load messages and window status on mount
  useEffect(() => {
    loadMessages();
    loadWindowStatus();
    
    // Check window status every 5 seconds
    windowCheckInterval.current = setInterval(loadWindowStatus, 5000);
    
    // Poll for new messages every 2 seconds
    const messageInterval = setInterval(loadMessages, 2000);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(windowCheckInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadWindowStatus = async () => {
    try {
      const status = await getChatStatus(appointment._id);
      setWindowInfo(status.windowInfo);
      
      const now = new Date();
      const appointmentStart = new Date(status.windowInfo.appointmentStart);
      const appointmentEnd = new Date(status.windowInfo.messageUntil);
      
      // Can message if confirmed and within time window
      const isWithinWindow = now >= appointmentStart && now <= appointmentEnd;
      const isConfirmed = status.windowInfo.isConfirmed;
      const isCompleted = status.windowInfo.isCompleted;
      
      if (isCompleted) {
        setCanMessage(false);
        setMessageReason('completed');
      } else if (!isConfirmed) {
        setCanMessage(false);
        setMessageReason('not_confirmed');
      } else if (!isWithinWindow) {
        setCanMessage(false);
        if (now < appointmentStart) {
          setMessageReason('not_started');
        } else {
          setMessageReason('ended');
        }
      } else {
        setCanMessage(true);
        setMessageReason('');
      }
    } catch (err) {
      console.error('Error loading window status:', err);
    }
  };

  const loadMessages = async () => {
    try {
      setError(null);
      const data = await getMessages(appointment._id);
      const messagesArray = Array.isArray(data) ? data : (data.messages || data.data || []);
      setMessages(messagesArray);
      setLoading(false);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const formatTimeWindow = () => {
    if (!windowInfo) return '';
    const start = new Date(windowInfo.appointmentStart);
    const end = new Date(windowInfo.messageUntil);
    return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getMessageReasonText = () => {
    switch (messageReason) {
      case 'completed':
        return '✓ Consultation completed. Messages are no longer available.';
      case 'not_confirmed':
        return '⏳ Waiting for teacher to confirm the appointment before messaging.';
      case 'not_started':
        return `⏱ Messaging available during your appointment time (${formatTimeWindow()}).`;
      case 'ended':
        return '✓ Consultation time ended. Messaging is no longer available.';
      default:
        return '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    // Final check before sending
    if (!canMessage) {
      setError(getMessageReasonText());
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      await sendMessage(
        appointment._id,
        otherUser._id,
        newMessage.trim(),
        'text'
      );
      
      setNewMessage('');
      await loadMessages();
      await loadWindowStatus();
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (createdAt) => {
    const date = new Date(createdAt);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const messagesByDate = messages.reduce((acc, msg) => {
    const date = formatMessageDate(msg.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="chatbox-wrapper">
      {/* Header */}
      <div className="chatbox-header">
        <div className="chatbox-header-info">
          <h3>Chat with {otherUser.name || otherUser.studentID}</h3>
          <p className="chatbox-subject">{appointment.subject?.name || 'Consultation'}</p>
          {windowInfo && (
            <p className="chatbox-time-window">
              <Clock size={14} />
              Duration: {windowInfo.slotDuration} min
              {canMessage && ` | Active: ${formatTimeWindow()}`}
            </p>
          )}
        </div>
        <button className="chatbox-close" onClick={onClose} title="Close chat">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chatbox-messages">
        {loading ? (
          <div className="chatbox-loading">
            <Loader size={32} className="spinner" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chatbox-empty">
            <p>No messages yet. Start the conversation!</p>
            {canMessage && <p className="hint-text">💬 Messaging is available during your appointment time</p>}
          </div>
        ) : (
          <div className="messages-container">
            {Object.entries(messagesByDate).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="message-date-divider">
                  <span>{date}</span>
                </div>
                {dateMessages.map(msg => (
                  <div
                    key={msg._id}
                    className={`message-item ${msg.sender._id === user._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      <p className="message-content">{msg.content}</p>
                      <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
                      {msg.sender._id === user._id && (
                        <span className="message-status">
                          {msg.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Messaging Window Status */}
      {windowInfo && !canMessage && (
        <div className={`chatbox-status chatbox-status-${messageReason}`}>
          <AlertCircle size={16} />
          <p>{getMessageReasonText()}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="chatbox-error">
          <p>{error}</p>
        </div>
      )}

      {/* Message Input */}
      {canMessage ? (
        <form className="chatbox-input-form chatbox-input-active" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="chatbox-input"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="chatbox-send-btn"
            title="Send message"
          >
            {sending ? (
              <Loader size={18} className="spinner" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      ) : (
        <div className="chatbox-input-form chatbox-input-disabled">
          <input
            type="text"
            placeholder={
              messageReason === 'completed'
                ? 'Consultation completed'
                : messageReason === 'not_confirmed'
                ? 'Waiting for confirmation'
                : messageReason === 'not_started'
                ? `Messaging available at ${windowInfo ? new Date(windowInfo.appointmentStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}`
                : 'Consultation time ended'
            }
            disabled={true}
            className="chatbox-input"
          />
          <button
            type="button"
            disabled={true}
            className="chatbox-send-btn"
            title="Messaging not available"
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;

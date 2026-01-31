import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader } from 'lucide-react';
import { getMessages, sendMessage } from '../../api/messageAPI';
import { useAuth } from '../../context/AuthContext';
import '../../styles/chatbox.css';

const ChatBox = ({ appointment, otherUser, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [appointment._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
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
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
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

      {/* Error Message */}
      {error && (
        <div className="chatbox-error">
          <p>{error}</p>
        </div>
      )}

      {/* Message Input */}
      <form className="chatbox-input-form" onSubmit={handleSendMessage}>
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
    </div>
  );
};

export default ChatBox;

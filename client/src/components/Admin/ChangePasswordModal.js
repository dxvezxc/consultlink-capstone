import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import adminAPI from '../../api/admin';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ teacher, onClose, onPasswordChanged }) => {
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔑 Resetting password for teacher:', teacher._id);
      const response = await adminAPI.resetTeacherPassword(teacher._id);
      console.log('✅ Response received:', response);
      
      if (response && response.newPassword) {
        console.log('✅ Password found in response');
        setGeneratedPassword(response.newPassword);
      } else {
        console.log('❌ No password in response:', response);
        setError('Server did not return a password. Response: ' + JSON.stringify(response));
      }
    } catch (err) {
      console.error('❌ Error resetting password:', err);
      setError(err.response?.data?.msg || err.message || 'Failed to generate password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reset Password - {teacher.name}</h3>
          <FaTimes 
            className="modal-close-btn" 
            onClick={onClose}
          />
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #f99',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '15px',
              color: '#c33'
            }}>
              ❌ {error}
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={teacher.email}
              disabled
              className="form-control"
            />
          </div>

          {!generatedPassword ? (
            <div className="reset-info">
              <p className="info-text">
                Generate a new secure password for this teacher. The system will create a random, secure password.
              </p>
              <div className="password-hint">
                <strong>How it works:</strong>
                <ul>
                  <li>✓ Generates a secure random password</li>
                  <li>✓ Password is encrypted in the database</li>
                  <li>✓ Share with teacher securely</li>
                  <li>✓ Teacher can change it later</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="password-success">
              <h4>✓ Password Generated Successfully</h4>
              <div className="generated-password-box">
                <p className="password-label">New Password:</p>
                <div className="password-display">
                  <code>{generatedPassword}</code>
                  <button 
                    className="copy-btn"
                    onClick={handleCopyPassword}
                    title="Copy to clipboard"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
              <div className="warning-box">
                <strong>⚠️ Important:</strong> Share this password with the teacher securely. 
                The password is now active and they can use it to log in.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
          {!generatedPassword && (
            <button
              type="button"
              className="btn-submit"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate New Password'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

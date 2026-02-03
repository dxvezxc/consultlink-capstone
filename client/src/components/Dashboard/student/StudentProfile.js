import React, { useState } from 'react';
import { authAPI } from '../../../api/auth';
import { Eye, EyeOff } from 'lucide-react';

const StudentProfile = ({ user, onBack, stats }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async () => {
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);

      setTimeout(() => {
        setPasswordSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('StudentProfile: Password change error:', err);
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="profile-view">
      <div className="view-header">
        <h2>My Profile</h2>
        <button 
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </div>
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{user?.name || 'Student'}</h3>
              <p className="profile-email">{user?.email || 'No email'}</p>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-group">
              <label>Student ID</label>
              <p className="detail-value">{user?.studentID || 'N/A'}</p>
            </div>
            
            <div className="detail-group">
              <label>Role</label>
              <p className="detail-value">Student</p>
            </div>
            
            <div className="detail-group">
              <label>Account Status</label>
              <p className="detail-value">
                <span className="status-active">✓ Active</span>
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-value">{stats?.completed || 0}</div>
              <div className="stat-label">Completed Sessions</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats?.pending || 0}</div>
              <div className="stat-label">Pending Sessions</div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="change-password-btn"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Change Password
            </button>
          </div>

          {showPasswordForm && (
            <div className="password-form">
              {passwordError && (
                <div className="password-error">⚠ {passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="password-success">✓ {passwordSuccess}</div>
              )}

              <div className="password-field">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="password-actions">
                <button
                  className="password-submit-btn"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  className="password-cancel-btn"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

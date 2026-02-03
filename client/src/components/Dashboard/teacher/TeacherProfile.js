import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { subjectsAPI } from '../../../api/subjects';
import { authAPI } from '../../../api/auth';
import { Edit, Save, X, Eye, EyeOff } from 'lucide-react';

const TeacherProfile = ({ user, onBack, onProfileUpdate }) => {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
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

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    subjects: user?.subjects || []
  });

  // Load subjects for selection
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjects = await subjectsAPI.getAll();
        setAllSubjects(subjects || []);
        
        // Extract subject IDs from user?.subjects (could be objects or IDs)
        const subjectIds = user?.subjects?.map(s => 
          typeof s === 'string' ? s : (s._id || s.id)
        ) || [];
        setTeacherSubjects(subjectIds);
      } catch (err) {
        console.error('Error loading subjects:', err);
      }
    };
    
    loadSubjects();
  }, [user]);

  // Sync formData when user prop changes
  useEffect(() => {
    // Extract subject IDs from user?.subjects (could be objects or IDs)
    const subjectIds = user?.subjects?.map(s => 
      typeof s === 'string' ? s : (s._id || s.id)
    ) || [];
    
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      subjects: subjectIds
    });
    setTeacherSubjects(subjectIds);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubject = (subjectId) => {
    if (!teacherSubjects.includes(subjectId)) {
      const newSubjects = [...teacherSubjects, subjectId];
      setTeacherSubjects(newSubjects);
      setFormData(prev => ({
        ...prev,
        subjects: newSubjects
      }));
    }
  };

  const handleRemoveSubject = (subjectId) => {
    const newSubjects = teacherSubjects.filter(id => id !== subjectId);
    setTeacherSubjects(newSubjects);
    setFormData(prev => ({
      ...prev,
      subjects: newSubjects
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('TeacherProfile: Saving with formData:', formData);
      const updatedUser = await updateProfile(formData);
      console.log('TeacherProfile: Updated user returned:', updatedUser);
      
      // Update parent component with new user data immediately
      if (updatedUser && onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      
      // Exit edit mode immediately
      setIsEditing(false);
      
      // Show success message and auto-clear it
      setSuccess('Profile updated successfully!');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('TeacherProfile: Save error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
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

  const handleCancel = () => {
    // Extract subject IDs from user?.subjects (could be objects or IDs)
    const subjectIds = user?.subjects?.map(s => 
      typeof s === 'string' ? s : (s._id || s.id)
    ) || [];
    
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      subjects: subjectIds
    });
    setTeacherSubjects(subjectIds);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const getSubjectName = (subjectId) => {
    const subject = allSubjects.find(s => s._id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const availableSubjects = allSubjects.filter(subject =>
    !teacherSubjects.includes(subject._id)
  );

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
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="profile-info">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="profile-name-input"
                  placeholder="Enter your name"
                />
              ) : (
                <h3 className="profile-name">{user?.name || 'Teacher'}</h3>
              )}
              <p className="profile-email">{user?.email || 'No email'}</p>
            </div>
            {!isEditing && (
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="profile-error">
              <span>⚠</span> {error}
            </div>
          )}

          {success && (
            <div className="profile-success">
              <span>✓</span> {success}
            </div>
          )}

          <div className="profile-details">
            <div className="detail-group">
              <label>Role</label>
              <p className="detail-value">Teacher</p>
            </div>

            <div className="detail-group">
              <label>Department</label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Enter your department"
                />
              ) : (
                <p className="detail-value">{user?.department || 'Not specified'}</p>
              )}
            </div>

            <div className="detail-group">
              <label>My Subjects</label>
              {isEditing ? (
                <div className="subjects-editor">
                  <div className="current-subjects">
                    {teacherSubjects.length > 0 ? (
                      teacherSubjects.map(subjectId => (
                        <div key={subjectId} className="subject-tag">
                          {getSubjectName(subjectId)}
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(subjectId)}
                            className="remove-subject-btn"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-subjects">No subjects selected</p>
                    )}
                  </div>

                  {availableSubjects.length > 0 && (
                    <div className="add-subjects">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddSubject(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Add a subject...</option>
                        {availableSubjects.map(subject => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="subjects-display">
                  {user?.subjects && user.subjects.length > 0 ? (
                    user.subjects.map(subject => {
                      // Handle both full objects and IDs
                      const subjectId = typeof subject === 'string' ? subject : (subject._id || subject.id);
                      const subjectName = typeof subject === 'string' 
                        ? getSubjectName(subject) 
                        : (subject.name || 'Unknown Subject');
                      
                      return (
                        <span key={subjectId} className="subject-tag">
                          {subjectName}
                        </span>
                      );
                    })
                  ) : (
                    <p className="detail-value">No subjects assigned</p>
                  )}
                </div>
              )}
            </div>

            <div className="detail-group">
              <label>Account Status</label>
              <p className="detail-value">
                <span className="status-active">✓ Active</span>
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button
                className="save-profile-btn"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                className="cancel-edit-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="profile-container" style={{ marginTop: '30px' }}>
        <div className="profile-card">
          <div className="profile-header" style={{ paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
              Security Settings
            </h3>
          </div>

          {passwordError && (
            <div className="profile-error">
              <span>⚠</span> {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="profile-success">
              <span>✓</span> {passwordSuccess}
            </div>
          )}

          {!showPasswordForm ? (
            <button
              className="change-password-btn"
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </button>
          ) : (
            <div className="password-form" style={{ marginTop: '20px' }}>
              <div className="detail-group">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your current password"
                  />
                  <button
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('current')}
                    type="button"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="detail-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your new password"
                  />
                  <button
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('new')}
                    type="button"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="detail-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm your new password"
                  />
                  <button
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('confirm')}
                    type="button"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="password-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  className="save-profile-btn"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Changing...' : (
                    <>
                      <Save size={16} />
                      Change Password
                    </>
                  )}
                </button>
                <button
                  className="cancel-edit-btn"
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
                  disabled={passwordLoading}
                >
                  <X size={16} />
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

export default TeacherProfile;
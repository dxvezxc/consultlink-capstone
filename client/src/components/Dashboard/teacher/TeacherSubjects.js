import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, BookOpen, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { subjectsAPI } from '../../../api/subjects';
import '../../styles/teacher-subjects.css';

const TeacherSubjects = () => {
  const { user } = useAuth();
  const [allSubjects, setAllSubjects] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all subjects and user's selected subjects
  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all subjects - axios interceptor returns response.data directly
      const subjectsResponse = await subjectsAPI.getAll();
      console.log('[loadSubjects] subjectsResponse:', subjectsResponse);
      
      // subjectsResponse IS the array (not wrapped), because axios interceptor unwraps it
      const allSubjectsList = Array.isArray(subjectsResponse) 
        ? subjectsResponse 
        : (Array.isArray(subjectsResponse.data) ? subjectsResponse.data : []);
      
      console.log('All subjects loaded:', allSubjectsList);
      setAllSubjects(allSubjectsList);

      // Get user's subjects (from user profile)
      const token = localStorage.getItem('token');
      console.log('Fetching user subjects for:', user._id);
      
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('User response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        
        // Handle both response.data.subjects and response.subjects
        const subjects = userData.data?.subjects || userData.subjects || [];
        console.log('My subjects:', subjects);
        
        if (Array.isArray(subjects)) {
          setMySubjects(subjects);
        } else {
          console.error('Subjects is not an array:', subjects);
          setMySubjects([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load user:', response.status, errorText);
        setError('Failed to load your subjects');
        setMySubjects([]);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError('Failed to load subjects: ' + err.message);
      setMySubjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load subjects on mount
  useEffect(() => {
    if (user?._id) {
      loadSubjects();
    }
  }, [user, loadSubjects]);

  // Get available subjects (not yet selected)
  const availableSubjects = allSubjects.filter(
    subject => !mySubjects.find(mySub => mySub._id === subject._id)
  );

  const handleSelectSubject = async (subjectId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      console.log('Selecting subject:', subjectId);
      console.log('User ID:', user._id);
      console.log('Token exists:', !!token);

      const response = await fetch(`http://localhost:5000/api/users/${user._id}/subjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subjectId })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Subject selection response:', data);
        
        // Reload all data to ensure consistency
        await loadSubjects();
        setShowPicker(false);
      } else {
        const errorText = await response.text();
        console.error('Failed response:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || errorData.error || 'Failed to select subject');
        } catch {
          setError(`Failed to select subject: ${response.status}`);
        }
      }
    } catch (err) {
      console.error('Error selecting subject:', err);
      setError('Error selecting subject: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    if (!window.confirm('Remove this subject?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      console.log('Removing subject:', subjectId);

      const response = await fetch(`http://localhost:5000/api/users/${user._id}/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Remove response status:', response.status);

      if (response.ok) {
        // Reload all data to ensure consistency
        await loadSubjects();
      } else {
        const errorText = await response.text();
        console.error('Failed to remove:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || errorData.error || 'Failed to remove subject');
        } catch {
          setError(`Failed to remove subject: ${response.status}`);
        }
      }
    } catch (err) {
      console.error('Error removing subject:', err);
      setError('Error removing subject: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-subjects-container">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="subjects-header">
        <h2>Professional Subjects</h2>
        <p>Select the subjects you teach from the available options.</p>
      </div>

      {/* Pick Subjects Button */}
      <div className="pick-subjects-btn-container">
        <button
          className="pick-subjects-btn"
          onClick={() => setShowPicker(!showPicker)}
          disabled={loading || availableSubjects.length === 0}
        >
          <Plus size={20} />
          Pick Professional Subjects
        </button>
        {availableSubjects.length > 0 && (
          <span className="available-count">{availableSubjects.length} available</span>
        )}
      </div>

      {/* Subject Picker Modal */}
      {showPicker && (
        <div className="subjects-modal-overlay">
          <div className="subjects-modal">
            <div className="modal-header">
              <h3>Select Subjects You Teach</h3>
              <button
                className="modal-close"
                onClick={() => setShowPicker(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {availableSubjects.length === 0 ? (
                <div className="empty-state">
                  <BookOpen size={40} />
                  <p>All available subjects have been selected.</p>
                </div>
              ) : (
                <div className="available-subjects-grid">
                  {availableSubjects.map(subject => (
                    <div key={subject._id} className="subject-card-picker">
                      <div className="subject-header">
                        <div className="subject-code-badge">{subject.code}</div>
                      </div>
                      <h4>{subject.name}</h4>
                      <p className="subject-desc">{subject.description}</p>
                      {subject.department && (
                        <p className="subject-dept">Dept: {subject.department}</p>
                      )}
                      <button
                        className="select-btn"
                        onClick={() => handleSelectSubject(subject._id)}
                        disabled={loading}
                      >
                        <Plus size={16} />
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Subjects Display */}
      <div className="my-subjects-section">
        <h3>Your Selected Subjects</h3>
        {mySubjects.length === 0 ? (
          <div className="empty-subjects">
            <BookOpen size={48} className="empty-icon" />
            <h4>No Subjects Selected</h4>
            <p>Click "Pick Professional Subjects" to select the subjects you teach.</p>
          </div>
        ) : (
          <div className="subjects-grid">
            {mySubjects.map(subject => (
              <div key={subject._id} className="subject-card">
                <div className="subject-header">
                  <div className="subject-code-badge">{subject.code}</div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveSubject(subject._id)}
                    title="Remove this subject"
                    disabled={loading}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h4>{subject.name}</h4>
                <p className="subject-desc">{subject.description}</p>
                {subject.department && (
                  <p className="subject-dept">Department: {subject.department}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSubjects;

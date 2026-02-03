import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSync } from 'react-icons/fa';
import adminAPI from '../../api/admin';
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import './TeachersCardView.css';

const TeachersCardView = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getTeachers();
      setTeachers(Array.isArray(data) ? data : data.teachers || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (teacher) => {
    setEditingTeacher(teacher);
  };

  const handleDeleteClick = (teacher) => {
    setDeletingTeacher(teacher);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;

    setDeleting(true);
    try {
      await adminAPI.deleteTeacher(deletingTeacher._id);
      setTeachers(teachers.filter(t => t._id !== deletingTeacher._id));
      setDeletingTeacher(null);
      alert(`Teacher ${deletingTeacher.name} has been deleted successfully.`);
    } catch (err) {
      console.error('Error deleting teacher:', err);
      alert('Error deleting teacher. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="teachers-view loading">
        <div className="spinner"></div>
        <p>Loading teachers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teachers-view error">
        <p>❌ {error}</p>
        <button onClick={fetchTeachers} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="teachers-view">
        <div className="teachers-header">
          <h2>📚 Teachers Management</h2>
          <p>Manage teacher accounts, reset passwords, and delete teachers</p>
        </div>

        {teachers.length === 0 ? (
          <div className="no-teachers">
            <p>No teachers found</p>
          </div>
        ) : (
          <div className="teachers-grid">
            {teachers.map(teacher => (
              <div key={teacher._id} className="teacher-card">
                <div className="card-header-top">
                  <div className="avatar">
                    {teacher.name?.charAt(0) || 'T'}
                  </div>
                  <div className="teacher-basic">
                    <h3>{teacher.name}</h3>
                    <p className="email">{teacher.email}</p>
                  </div>
                </div>

                <div className="teacher-details">
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="subjects-section">
                      <label>Subjects:</label>
                      <div className="subjects-list">
                        {teacher.subjects.map((subject, idx) => (
                          <span key={idx} className="subject-badge">
                            {typeof subject === 'object' ? subject.name : subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="status-section">
                    <span className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                      {teacher.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn reset-btn"
                    onClick={() => handleResetPassword(teacher)}
                    title="Reset Password"
                  >
                    <FaSync /> Reset Password
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteClick(teacher)}
                    title="Delete Teacher"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingTeacher && (
        <ChangePasswordModal
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onPasswordChanged={() => {
            setEditingTeacher(null);
            fetchTeachers();
          }}
        />
      )}

      {deletingTeacher && (
        <ConfirmDeleteModal
          teacher={deletingTeacher}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTeacher(null)}
          loading={deleting}
        />
      )}
    </>
  );
};

export default TeachersCardView;

// client/src/components/Admin/ManageTeachers.js
import React, { useState, useEffect } from 'react';
import TeacherTable from './TeacherTable';
import adminAPI from '../../api/admin';
import './ManageTeachers.css';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleTeacherDeleted = (teacherId) => {
    setTeachers(teachers.filter(t => t._id !== teacherId));
  };

  const handleTeachersUpdated = () => {
    fetchTeachers();
  };

  if (loading) {
    return (
      <div className="manage-teachers-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-teachers-container">
      <div className="page-header">
        <div className="header-content">
          <h1>📚 Manage Teachers</h1>
          <p className="subtitle">Manage teacher accounts, reset passwords, and delete teachers</p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <span>❌</span>
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="teachers-section">
        <div className="section-header">
          <h2>Teachers ({teachers.length})</h2>
          <button className="primary-btn">+ Add New Teacher</button>
        </div>

        {teachers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🏫</div>
            <h3>No teachers found</h3>
            <p>Start by adding your first teacher to the system.</p>
            <button className="primary-btn">+ Add Teacher</button>
          </div>
        ) : (
          <TeacherTable 
            teachers={teachers} 
            onTeacherDeleted={handleTeacherDeleted}
            onTeachersUpdated={handleTeachersUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default ManageTeachers;
// client/src/components/Admin/TeacherTable.js
import React, { useState } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import adminAPI from '../../api/admin';
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const TeacherTable = ({ teachers, onTeacherDeleted, onTeachersUpdated }) => {
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = (teacher) => {
    setDeletingTeacher(teacher);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteTeacher(deletingTeacher._id);
      setDeletingTeacher(null);
      if (onTeacherDeleted) onTeacherDeleted(deletingTeacher._id);
      alert(`Teacher ${deletingTeacher.name} has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Error deleting teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
  };

  return (
    <>
      <div className="teachers-table-container">
        <table className="teachers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Subjects</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {teachers && teachers.length > 0 ? (
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="teacher-name">
                    <div className="avatar">{teacher.name?.charAt(0) || 'T'}</div>
                    <span>{teacher.name}</span>
                  </td>
                  <td>{teacher.email}</td>
                  <td>
                    <span className="role-badge">{teacher.role}</span>
                  </td>
                  <td>
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      <div className="subjects-list">
                        {teacher.subjects.map((subject, idx) => (
                          <span key={idx} className="subject-tag">
                            {typeof subject === 'object' ? subject.name : subject}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">No subjects</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                      {teacher.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(teacher)}
                      title="Reset Password"
                    >
                      <FaEdit /> Reset Password
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(teacher)}
                      title="Delete Teacher"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No teachers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingTeacher && (
        <ChangePasswordModal 
          teacher={editingTeacher} 
          onClose={() => setEditingTeacher(null)}
          onPasswordChanged={() => {
            setEditingTeacher(null);
            if (onTeachersUpdated) onTeachersUpdated();
          }}
        />
      )}

      {deletingTeacher && (
        <ConfirmDeleteModal 
          teacher={deletingTeacher}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTeacher(null)}
          loading={loading}
        />
      )}
    </>
  );
};

export default TeacherTable;
import React from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './ConfirmDeleteModal.css';

const ConfirmDeleteModal = ({ teacher, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="warning-icon">
            <FaExclamationTriangle />
          </div>
          <h3>Delete Teacher</h3>
          <FaTimes 
            className="modal-close-btn" 
            onClick={onCancel}
          />
        </div>

        <div className="modal-body">
          <p className="warning-text">
            Are you sure you want to delete <strong>{teacher.name}</strong>?
          </p>
          <p className="delete-consequences">
            This action cannot be undone. The teacher will be permanently removed from the system.
          </p>
          <div className="teacher-details">
            <p><strong>Email:</strong> {teacher.email}</p>
            {teacher.subject && <p><strong>Subject:</strong> {teacher.subject}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Teacher'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

// Teacher Selector Component
// Component for selecting a teacher

import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import '../../styles/teacher-selector.css';

export default function TeacherSelector({ onTeacherSelect, selectedTeacher }) {
  const { data: teachers } = useFetch('/teachers/all');

  return (
    <div className="teacher-selector">
      {teachers && teachers.length > 0 ? (
        <div className="teachers-grid">
          {teachers.map(teacher => (
            <div
              key={teacher._id}
              className={`teacher-card ${selectedTeacher?._id === teacher._id ? 'selected' : ''}`}
              onClick={() => onTeacherSelect(teacher)}
            >
              <div className="teacher-avatar">
                {teacher.name.charAt(0).toUpperCase()}
              </div>
              <h3>{teacher.name}</h3>
              <p>{teacher.department}</p>
              <button className="btn-select">Select</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No teachers available</p>
      )}
    </div>
  );
}

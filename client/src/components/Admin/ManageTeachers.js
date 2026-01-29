// client/src/components/Admin/ManageTeachers.js
import React, { useState } from 'react';
import TeacherTable from './TeacherTable';

const ManageTeachers = () => {
  const [teachers] = useState([
    {
      id: 1,
      name: 'Juan Dela Cruz',
      email: 'juan@consultlink.edu',
      subject: 'Web Development',
      password: 'X9A@2kP!',
    },
  ]);

  return (
    <div className="card-container">
      <div className="card-header">
        <h4>Manage Teachers</h4>

        <button className="primary-btn">+ Add New Teacher</button>
      </div>

      <TeacherTable teachers={teachers} />
    </div>
  );
};

export default ManageTeachers;
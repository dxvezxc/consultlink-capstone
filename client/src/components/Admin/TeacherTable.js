// client/src/components/Admin/TeacherTable.js
import React, { useState } from 'react';
import { FaEye, FaTrash, FaEdit } from 'react-icons/fa';

const TeacherTable = ({ teachers }) => {
  const [visiblePassword, setVisiblePassword] = useState(null);

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Assigned Subject</th>
          <th>Password</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {teachers.map((t) => (
          <tr key={t.id}>
            <td>{t.name}</td>
            <td>{t.email}</td>
            <td>{t.subject}</td>
            <td>
              {visiblePassword === t.id ? t.password : '••••••••'}
              <FaEye
                className="action-icon"
                onClick={() =>
                  setVisiblePassword(
                    visiblePassword === t.id ? null : t.id
                  )
                }
              />
            </td>
            <td>
              <FaEdit className="action-icon edit" />
              <FaTrash className="action-icon delete" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TeacherTable;
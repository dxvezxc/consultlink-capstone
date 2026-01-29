import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/studentDashboard.css';

const SubjectSelector = ({ onSelect }) => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('/api/subjects');
        setSubjects(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="booking-card">
      <h3>Select a Subject</h3>
      <div className="subject-grid">
        {subjects.map(subject => (
          <div
            key={subject._id}
            className="subject-card"
            onClick={() => onSelect(subject)}
          >
            <h4>{subject.name}</h4>
            <p>{subject.consultants?.length || 0} Consultant(s) Available</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;
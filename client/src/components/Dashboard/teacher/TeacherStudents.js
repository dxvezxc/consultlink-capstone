import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MessageSquare, Video, Trash2, Search } from 'lucide-react';
import consultationsAPI from '../../../api/consultations';
import '../../../styles/teacherViews.css';

const TeacherStudents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [students, setStudents] = useState([]);

  // Load unique students from appointments
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await consultationsAPI.getUserConsultations({ status: '' });
        const appointments = response.consultations || response.data || [];
        
        // Get unique students from appointments
        const uniqueStudents = [];
        const seenIds = new Set();
        
        appointments.forEach(apt => {
          if (apt.student && !seenIds.has(apt.student._id)) {
            seenIds.add(apt.student._id);
            uniqueStudents.push({
              _id: apt.student._id,
              name: apt.student.name,
              email: apt.student.email,
              phone: apt.student.phone || 'N/A',
              studentID: apt.student.studentID,
              status: apt.student.isActive ? 'active' : 'inactive',
              totalSessions: appointments.filter(a => a.student._id === apt.student._id).length,
              lastSession: appointments.find(a => a.student._id === apt.student._id)?.dateTime || 'N/A'
            });
          }
        });
        
        setStudents(uniqueStudents);
      } catch (error) {
        console.error('Error loading students:', error);
        setStudents([]);
      }
    };
    
    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleContactStudent = (studentId) => {
    console.log('Contact student:', studentId);
  };

  const handleScheduleSession = (studentId) => {
    console.log('Schedule session:', studentId);
  };

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      setStudents(students.filter(s => s._id !== studentId));
    }
  };

  return (
    <div className="teacher-students">
      <div className="students-header">
        <div className="header-content">
          <h2>My Students</h2>
          <p className="header-subtitle">Manage your enrolled students and track their progress</p>
        </div>
        <div className="header-stats">
          <div className="stat-box">
            <Users size={20} />
            <div>
              <span className="stat-num">{students.length}</span>
              <span className="stat-label">Total Students</span>
            </div>
          </div>
        </div>
      </div>

      <div className="students-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['all', 'active', 'inactive'].map(tab => (
            <button
              key={tab}
              className={`filter-tab ${filterStatus === tab ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="students-container">
        {filteredStudents.length === 0 ? (
          <div className="empty-students">
            <Users size={48} className="empty-icon" />
            <h3>No Students Found</h3>
            <p>No students match your search or filter criteria.</p>
          </div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map(student => (
              <div key={student._id} className="student-card">
                <div className="student-header">
                  <div className="student-avatar">
                    {student.name.charAt(0)}
                  </div>
                  <div className="student-title">
                    <h3 className="student-name">{student.name}</h3>
                    <p className="student-id">{student.studentID}</p>
                  </div>
                  <span className={`student-status status-${student.status}`}>
                    {student.status}
                  </span>
                </div>

                <div className="student-body">
                  <div className="contact-info">
                    <a href={`mailto:${student.email}`} className="info-row">
                      <Mail size={16} />
                      <span>{student.email}</span>
                    </a>
                    <a href={`tel:${student.phone}`} className="info-row">
                      <Phone size={16} />
                      <span>{student.phone}</span>
                    </a>
                  </div>

                  <div className="student-subjects">
                    <p className="subjects-label">Subjects:</p>
                    <div className="subjects-list">
                      {student.subjects.map((subject, idx) => (
                        <span key={idx} className="subject-tag">{subject}</span>
                      ))}
                    </div>
                  </div>

                  <div className="student-stats">
                    <div className="stat-item">
                      <Video size={14} />
                      <span>{student.totalSessions} sessions</span>
                    </div>
                    <div className="stat-item">
                      <span className="last-session">Last: {new Date(student.lastSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="student-actions">
                  <button
                    className="action-btn contact-btn"
                    onClick={() => handleContactStudent(student._id)}
                    title="Send message"
                  >
                    <MessageSquare size={16} />
                    Message
                  </button>
                  <button
                    className="action-btn schedule-btn"
                    onClick={() => handleScheduleSession(student._id)}
                    title="Schedule session"
                  >
                    <Video size={16} />
                    Schedule
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleRemoveStudent(student._id)}
                    title="Remove student"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudents;

import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import consultationsAPI from '../../../api/consultations';
import ChatBox from '../../Chat/ChatBox';
import '../../../styles/teacherViews.css';

const TeacherRequests = () => {
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatAppointment, setChatAppointment] = useState(null);
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load real appointment requests
  const loadRequests = async () => {
    try {
      setRefreshing(true);
      console.log('TeacherRequests: Loading requests...');
      const response = await consultationsAPI.getUserConsultations({ status: '' });
      console.log('TeacherRequests: Full response:', response);
      console.log('TeacherRequests: response.consultations:', response.consultations);
      console.log('TeacherRequests: response.data:', response.data);
      
      // The axios interceptor returns response.data directly, so response IS the data
      const appointmentList = response.consultations || [];
      console.log('TeacherRequests: Final appointments list:', appointmentList);
      console.log('TeacherRequests: Count:', appointmentList.length);
      setRequests(appointmentList);
    } catch (error) {
      console.error('TeacherRequests: Error loading requests:', error);
      setRequests([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status?.toLowerCase() === filter.toLowerCase());

  const handleApprove = async (id) => {
    try {
      await consultationsAPI.approveConsultation(id);
      setRequests(requests.filter(req => req._id !== id));
      alert('Appointment confirmed!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error confirming appointment');
    }
  };

  const handleReject = async (id) => {
    try {
      await consultationsAPI.rejectConsultation(id, 'Declined by teacher');
      setRequests(requests.filter(req => req._id !== id));
      alert('Appointment rejected!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting appointment');
    }
  };

  const handleViewDetails = (request) => {
    console.log('TeacherRequests: Selected request status:', request.status);
    setSelectedRequest(request);
  };

  return (
    <div className="teacher-requests">
      <div className="requests-header">
        <h2>Appointment Requests</h2>
        <button 
          className="refresh-btn" 
          onClick={loadRequests}
          disabled={refreshing}
          title="Refresh requests"
        >
          {refreshing ? '⟳ Loading...' : '⟳ Refresh'}
        </button>
        <div className="requests-filters">
          <div className="filter-tabs">
            {['all', 'pending', 'confirmed', 'completed', 'canceled'].map(tab => (
              <button
                key={tab}
                className={`filter-tab ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="requests-stats">
            <span className="stat pending">{requests.filter(r => r.status?.toLowerCase() === 'pending').length} Pending</span>
            <span className="stat approved">{requests.filter(r => r.status?.toLowerCase() === 'confirmed').length} Confirmed</span>
          </div>
        </div>
      </div>

      <div className="requests-content">
        {/* Requests List */}
        <div className="requests-list">
          {filteredRequests.length === 0 ? (
            <div className="empty-requests">
              <Clock size={48} className="empty-icon" />
              <h3>No Requests Found</h3>
              <p>There are no {filter} appointment requests at the moment.</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <div key={request._id} className="request-card">
                <div className="request-header">
                  <div className="student-info">
                    <div className="student-avatar">
                      {request.student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="student-name">{request.student.name}</h4>
                      <p className="student-id">{request.student.studentID}</p>
                    </div>
                  </div>
                  <span className={`request-status status-${request.status}`}>
                    {request.status}
                  </span>
                </div>

                <div className="request-body">
                  <div className="request-subject">
                    <BookOpen size={16} />
                    <span>{typeof request.subject === 'object' ? request.subject?.name : request.subject}</span>
                  </div>
                  <p className="request-reason">{request.notes || 'No notes'}</p>
                  <div className="request-time">
                    <Clock size={14} />
                    <span>{new Date(request.dateTime).toLocaleDateString()} at {new Date(request.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                <div className="request-actions">
                  {request.status?.toLowerCase() === 'pending' && (
                    <>
                      <button 
                        className="action-btn approve-btn"
                        onClick={() => handleApprove(request._id)}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button 
                        className="action-btn reject-btn"
                        onClick={() => handleReject(request._id)}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {request.status?.toLowerCase() === 'confirmed' && (
                    <button 
                      className="action-btn message-btn"
                      onClick={() => setChatAppointment(request)}
                      title="Message Student"
                    >
                      <MessageSquare size={16} />
                      Message
                    </button>
                  )}
                  <button 
                    className="action-btn details-btn"
                    onClick={() => handleViewDetails(request)}
                  >
                    <MessageSquare size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Request Details Sidebar */}
        {selectedRequest && (
          <div className="request-details">
            {console.log('TeacherRequests: Rendering details sidebar, selectedRequest:', selectedRequest)}
            {console.log('TeacherRequests: Status check - confirmed:', selectedRequest.status === 'confirmed', 'completed:', selectedRequest.status === 'completed')}
            <div className="details-header">
              <h3>Request Details</h3>
              <button 
                className="close-details"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>
            
            <div className="student-details">
              <div className="student-avatar-large">
                {selectedRequest.student.name.charAt(0)}
              </div>
              <h4>{selectedRequest.student.name}</h4>
              <p className="student-email">{selectedRequest.student.email}</p>
              <p className="student-id">{selectedRequest.student.studentID}</p>
            </div>

            <div className="request-info">
              <div className="info-item">
                <strong>Subject:</strong>
                <span>{typeof selectedRequest.subject === 'object' ? selectedRequest.subject?.name : selectedRequest.subject}</span>
              </div>
              <div className="info-item">
                <strong>Date & Time:</strong>
                <span>{new Date(selectedRequest.dateTime).toLocaleDateString()} at {new Date(selectedRequest.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="info-item">
                <strong>Status:</strong>
                <span className={`status-badge status-${selectedRequest.status}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div className="info-item">
                <strong>Created:</strong>
                <span>{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="request-reason-full">
              <h4>Consultation Notes</h4>
              <p>{selectedRequest.notes || 'No notes provided'}</p>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="details-actions">
                <button 
                  className="action-btn full-approve"
                  onClick={() => handleApprove(selectedRequest._id)}
                >
                  <CheckCircle size={18} />
                  Approve Request
                </button>
                <button 
                  className="action-btn full-reject"
                  onClick={() => handleReject(selectedRequest._id)}
                >
                  <XCircle size={18} />
                  Reject Request
                </button>
              </div>
            )}
            
            {(selectedRequest.status?.toLowerCase() === 'confirmed' || selectedRequest.status?.toLowerCase() === 'completed') && (
              <div className="details-actions">
                <button 
                  className="action-btn message-full"
                  onClick={() => setChatAppointment(selectedRequest)}
                >
                  <MessageSquare size={18} />
                  Message Student
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chat Box */}
        {chatAppointment && (
          <div className="chatbox-overlay">
            <ChatBox
              appointment={chatAppointment}
              otherUser={chatAppointment.student}
              onClose={() => setChatAppointment(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherRequests;
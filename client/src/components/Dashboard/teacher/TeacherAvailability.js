import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Clock, Calendar, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { availabilityAPI } from '../../../api/availability';
import '../../../styles/teacherViews.css';

const TeacherAvailability = ({ slots, onManageAvailability, isFullView, onBack }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState(slots || []);
  const [mySubjects, setMySubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    subject: '',
    slotDuration: 30,
    maxCapacity: 1
  });

  const daysOfWeek = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ];

  // Load availability slots and teacher's selected subjects
  useEffect(() => {
    if (!user?._id) {
      console.log('User not available yet');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get availability slots
        try {
          const availRes = await availabilityAPI.getMyAvailability();
          console.log('availRes:', availRes);
          // availRes is already unwrapped by axios interceptor
          const slots = availRes.data || availRes || [];
          console.log('Setting availability slots:', slots);
          setAvailabilitySlots(Array.isArray(slots) ? slots : []);
        } catch (error) {
          console.error('Error loading availability:', error);
          setAvailabilitySlots([]);
        }

        // Get teacher's selected subjects from user profile
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setError('Authentication token not found');
          setMySubjects([]);
          return;
        }

        console.log('Fetching user subjects for:', user._id);
        const userRes = await fetch(`http://localhost:5000/api/users/${user._id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('User response status:', userRes.status);

        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('User data received:', userData);
          
          let subjects = [];
          if (userData.data && Array.isArray(userData.data.subjects)) {
            subjects = userData.data.subjects;
          } else if (Array.isArray(userData.subjects)) {
            subjects = userData.subjects;
          }
          
          console.log('Final subjects array:', subjects, 'Type:', Array.isArray(subjects));
          setMySubjects(subjects);
          
          if (subjects.length === 0) {
            setError(null); // Don't show error if no subjects, just empty state
          }
        } else {
          const errorText = await userRes.text();
          console.error('Failed to load user:', userRes.status, errorText);
          setError(`Failed to load subjects: ${userRes.status}`);
          setMySubjects([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error loading subjects: ' + error.message);
        setMySubjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newSlot.subject) {
      alert('Please select a subject');
      return;
    }
    if (!newSlot.startTime || !newSlot.endTime) {
      alert('Please select start and end times');
      return;
    }

    try {
      setLoading(true);
      const response = await availabilityAPI.createAvailability({
        subject: newSlot.subject,
        dayOfWeek: parseInt(newSlot.dayOfWeek),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        slotDuration: parseInt(newSlot.slotDuration),
        maxCapacity: parseInt(newSlot.maxCapacity || 1)
      });
      setAvailabilitySlots([...availabilitySlots, response.data]);
      setShowForm(false);
      setNewSlot({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        subject: '',
        slotDuration: 30,
        maxCapacity: 1
      });
      alert('Availability slot created successfully!');
    } catch (error) {
      console.error('Error creating slot:', error);
      alert('Error creating availability slot: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      setLoading(true);
      await availabilityAPI.deleteAvailability(id);
      setAvailabilitySlots(availabilitySlots.filter(slot => slot._id !== id));
      alert('Availability slot deleted successfully!');
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error deleting availability slot: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlot = (slot) => {
    console.log('Opening edit form for slot:', slot);
    setEditingSlot({
      _id: slot._id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: typeof slot.subject === 'object' ? slot.subject._id : slot.subject,
      slotDuration: slot.slotDuration || 30,
      maxStudents: slot.maxStudents || 5
    });
    setShowEditForm(true);
  };

  const handleSaveEditSlot = async (e) => {
    e.preventDefault();

    if (!editingSlot.subject) {
      alert('Please select a subject');
      return;
    }
    if (!editingSlot.startTime || !editingSlot.endTime) {
      alert('Please select start and end times');
      return;
    }

    try {
      setLoading(true);
      
      // Send update request to server
      // Backend returns: { success: true, data: availability }
      // Axios interceptor unwraps to: { success: true, data: availability }
      const apiResponse = await availabilityAPI.updateAvailability(editingSlot._id, {
        dayOfWeek: parseInt(editingSlot.dayOfWeek),
        subject: editingSlot.subject,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        slotDuration: parseInt(editingSlot.slotDuration),
        maxCapacity: parseInt(editingSlot.maxCapacity || 1)
      });
      
      console.log('=== Update API Response ===');
      console.log('Full response:', apiResponse);
      console.log('Response.data:', apiResponse.data);
      console.log('Response.success:', apiResponse.success);
      
      // Extract the actual availability object
      const updatedSlot = apiResponse.data;
      
      if (!updatedSlot) {
        console.error('No data in response!');
        throw new Error('No data returned from server');
      }
      
      console.log('Extracted updatedSlot:', updatedSlot);
      console.log('Slot ID:', updatedSlot._id);
      console.log('Subject info:', updatedSlot.subject);
      
      // Update the availability slots list with the updated slot
      setAvailabilitySlots(prevSlots => {
        const updated = prevSlots.map(slot => 
          slot._id === editingSlot._id ? updatedSlot : slot
        );
        console.log('Updated slots array:', updated);
        return updated;
      });
      
      setShowEditForm(false);
      setEditingSlot(null);
      alert('Availability slot updated successfully!');
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Error updating availability slot: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNumber) => {
    return daysOfWeek.find(day => day.id === dayNumber)?.name || 'Unknown';
  };

  return (
    <div className="teacher-availability">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {!isFullView ? (
        // Compact View for Dashboard
        <>
          <div className="availability-header">
            <h3>My Availability</h3>
            <button 
              className="manage-btn"
              onClick={onManageAvailability}
            >
              Manage
            </button>
          </div>

          <div className="availability-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <Calendar size={20} />
                <div>
                  <span className="stat-value">3</span>
                  <span className="stat-label">Days/Week</span>
                </div>
              </div>
              <div className="stat-item">
                <Clock size={20} />
                <div>
                  <span className="stat-value">18</span>
                  <span className="stat-label">Hours/Week</span>
                </div>
              </div>
            </div>

            <div className="upcoming-slots">
              <h4>This Week's Schedule</h4>
              {availabilitySlots.slice(0, 3).map(slot => (
                <div key={slot._id} className="slot-item">
                  <span className="slot-day">{getDayName(slot.dayOfWeek)}</span>
                  <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                  <span className="slot-subject">{slot.subject?.name || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="availability-full-header">
            <div className="header-content">
              <h2>Manage Availability</h2>
              <p className="header-subtitle">Set your consultation availability slots for the week</p>
            </div>
            <div className="header-actions">
              <button className="back-btn" onClick={onBack}>
                ← Back to Dashboard
              </button>
              <button 
                className="add-btn"
                onClick={() => setShowForm(!showForm)}
              >
                <Plus size={18} />
                Add New Slot
              </button>
            </div>
          </div>

          {showForm && (
            <div className="add-slot-card">
              <h3>Add New Availability Slot</h3>
              <form className="slot-form" onSubmit={handleAddSlot}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Day of Week</label>
                  <select 
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot({...newSlot, dayOfWeek: parseInt(e.target.value)})}
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select 
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({...newSlot, subject: e.target.value})}
                    required
                    disabled={loading || mySubjects.length === 0}
                  >
                    <option value="">
                      {loading ? 'Loading subjects...' : 'Select a subject'}
                    </option>
                    {mySubjects.length === 0 ? (
                      <option disabled>No subjects selected. Please add subjects first.</option>
                    ) : (
                      mySubjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name || 'Unnamed Subject'}
                        </option>
                      ))
                    )}
                  </select>
                  {mySubjects.length === 0 && (
                    <p className="form-hint">You need to select subjects in Professional Subjects first.</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Slot Duration (minutes)</label>
                  <input 
                    type="number" 
                    min="15" 
                    max="120"
                    step="15"
                    value={newSlot.slotDuration}
                    onChange={(e) => setNewSlot({...newSlot, slotDuration: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Max Students per Slot</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={newSlot.maxCapacity}
                    onChange={(e) => setNewSlot({...newSlot, maxCapacity: parseInt(e.target.value)})}
                  />
                  <p className="form-hint">Maximum 1 student per slot is recommended</p>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Slot
                </button>
              </div>
              </form>
            </div>
          )}

          {showEditForm && editingSlot && (
            <div className="add-slot-card">
              <h3>Edit Availability Slot</h3>
              <form className="slot-form" onSubmit={handleSaveEditSlot}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Day of Week</label>
                  <select 
                    value={editingSlot.dayOfWeek}
                    onChange={(e) => setEditingSlot({...editingSlot, dayOfWeek: parseInt(e.target.value)})}
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    value={editingSlot.startTime}
                    onChange={(e) => setEditingSlot({...editingSlot, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    value={editingSlot.endTime}
                    onChange={(e) => setEditingSlot({...editingSlot, endTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select 
                    value={editingSlot.subject}
                    onChange={(e) => setEditingSlot({...editingSlot, subject: e.target.value})}
                    required
                    disabled={loading || mySubjects.length === 0}
                  >
                    <option value="">
                      {loading ? 'Loading subjects...' : 'Select a subject'}
                    </option>
                    {mySubjects.length === 0 ? (
                      <option disabled>No subjects selected. Please add subjects first.</option>
                    ) : (
                      mySubjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name || 'Unnamed Subject'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Slot Duration (minutes)</label>
                  <input 
                    type="number" 
                    min="15" 
                    max="120"
                    step="15"
                    value={editingSlot.slotDuration}
                    onChange={(e) => setEditingSlot({...editingSlot, slotDuration: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Max Students per Slot</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={editingSlot.maxCapacity || 1}
                    onChange={(e) => setEditingSlot({...editingSlot, maxCapacity: parseInt(e.target.value)})}
                  />
                  <p className="form-hint">Maximum 1 student per slot is recommended</p>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Update Slot
                </button>
              </div>
              </form>
            </div>
          )}
          <div className="slots-container">
            <h3>Your Availability Slots</h3>
            {availabilitySlots.length === 0 ? (
              <div className="empty-slots-card">
                <AlertCircle size={48} className="empty-icon" />
                <h4>No Availability Slots</h4>
                <p>Add your first availability slot to start accepting student consultations.</p>
              </div>
            ) : (
              <div className="slots-grid">
                {availabilitySlots.map(slot => (
                  <div key={slot._id} className="slot-card">
                    <div className="slot-header">
                      <div className="slot-day-box">
                        <Calendar size={16} />
                        <span className="day-name">{getDayName(slot.dayOfWeek)}</span>
                      </div>
                      <div className="slot-actions">
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEditSlot(slot)}
                          title="Edit slot"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteSlot(slot._id)}
                          title="Delete slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="slot-body">
                      <div className="time-info">
                        <Clock size={16} />
                        <div>
                          <p className="time-label">Time</p>
                          <p className="time-value">{slot.startTime} - {slot.endTime}</p>
                        </div>
                      </div>

                      <div className="duration-info">
                        {(() => {
                          const start = parseInt(slot.startTime.split(':')[0]);
                          const end = parseInt(slot.endTime.split(':')[0]);
                          const hours = end - start;
                          const subjectName = typeof slot.subject === 'object' 
                            ? (slot.subject?.name || 'Unknown Subject')
                            : 'Unknown Subject';
                          return (
                            <>
                              <p className="duration-label">{hours} hour{hours !== 1 ? 's' : ''}</p>
                              <p className="duration-subject">{subjectName}</p>
                            </>
                          );
                        })()}
                      </div>

                      <div className="capacity-info">
                        <Users size={16} />
                        <div>
                          <p className="capacity-label">Max Capacity</p>
                          <p className="capacity-value">{slot.maxCapacity || 1} student{slot.maxCapacity !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherAvailability;
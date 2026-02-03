const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');

// Helper function to convert time string "HH:MM" to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to time string "HH:MM"
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// @desc    Get available slots for a teacher on a specific date
// @route   GET /api/availability/slots
// @access  Public
router.get('/slots', async (req, res) => {
  try {
    const { teacherId, subjectId, date } = req.query;

    if (!teacherId || !subjectId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: teacherId, subjectId, date'
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Find availability slots for this teacher on this day
    const availabilitySlots = await Availability.find({
      teacher: teacherId,
      subject: subjectId,
      dayOfWeek: dayOfWeek,
      $or: [
        { validUntil: { $exists: false } },
        { validUntil: { $gte: selectedDate } }
      ]
    });

    res.status(200).json({
      success: true,
      date: date,
      dayOfWeek: dayOfWeek,
      slots: availabilitySlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching available slots',
      message: error.message
    });
  }
});

// @desc    Get all availability slots for a teacher
// @route   GET /api/availability/teacher/:teacherId
// @access  Public
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const availability = await Availability.find({ 
      teacher: req.params.teacherId
    }).populate('subject', 'name code description')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Get current user's availability (teacher)
// @route   GET /api/availability/me
// @access  Private/Teacher
router.get('/me', protect, authorize('teacher'), async (req, res) => {
  try {
    const availability = await Availability.find({ 
      teacher: req.user._id 
    }).populate('subject', 'name code description')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (err) {
    console.error('Get my availability error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Create availability slot
// @route   POST /api/availability
// @access  Private/Teacher
router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { subject, dayOfWeek, startTime, endTime, slotDuration, isRecurring, validFrom, validUntil } = req.body;
    
    // Validate required fields
    if (!subject || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide subject, dayOfWeek, startTime, and endTime' 
      });
    }

    // Validate end time is after start time
    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }
    
    const availabilityData = {
      teacher: req.user._id,
      subject,
      dayOfWeek,
      startTime,
      endTime
    };
    
    // Add optional fields if provided
    if (slotDuration) availabilityData.slotDuration = slotDuration;
    if (isRecurring !== undefined) availabilityData.isRecurring = isRecurring;
    if (validFrom) availabilityData.validFrom = validFrom;
    if (validUntil) availabilityData.validUntil = validUntil;
    
    const availability = await Availability.create(availabilityData);
    
    // Populate subject before returning
    await availability.populate('subject', 'name code description');
    
    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (err) {
    console.error('Create availability error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        error: messages.join(', ')
      });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'This availability slot already exists' 
      });
    }
    
    // Handle custom validation errors
    if (err.message && err.message.includes('End time must be after start time')) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }
    
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// @desc    Update availability slot
// @route   PUT /api/availability/:id
// @access  Private/Teacher
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    console.log('Update request for slot:', req.params.id);
    console.log('Update data received:', req.body);
    
    let availability = await Availability.findById(req.params.id);
    
    if (!availability) {
      return res.status(404).json({ success: false, error: 'Availability not found' });
    }
    
    // Make sure user owns the availability
    if (availability.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    // Only allow updating these fields
    const allowedFields = ['dayOfWeek', 'subject', 'startTime', 'endTime', 'slotDuration', 'maxCapacity', 'validUntil'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    console.log('Allowed updates:', updates);
    
    // Manual validation for endTime
    const startTime = updates.startTime || availability.startTime;
    const endTime = updates.endTime || availability.endTime;
    
    if (endTime && startTime && endTime <= startTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'End time must be after start time' 
      });
    }
    
    availability = await Availability.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: false }
    ).populate('subject', 'name code description');
    
    console.log('Updated availability:', availability);
    
    res.json({
      success: true,
      data: availability
    });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ success: false, error: 'Server error', message: err.message });
  }
});

// @desc    Delete availability slot
// @route   DELETE /api/availability/:id
// @access  Private/Teacher
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);
    
    if (!availability) {
      return res.status(404).json({ success: false, error: 'Availability not found' });
    }
    
    // Make sure user owns the availability
    if (availability.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    await availability.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete availability error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

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
      teacher: req.user.id 
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
    
    const availabilityData = {
      teacher: req.user.id,
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
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'This availability slot already exists' 
      });
    }
    
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Update availability slot
// @route   PUT /api/availability/:id
// @access  Private/Teacher
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    let availability = await Availability.findById(req.params.id);
    
    if (!availability) {
      return res.status(404).json({ success: false, error: 'Availability not found' });
    }
    
    // Make sure user owns the availability
    if (availability.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    availability = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject', 'name code description');
    
    res.json({
      success: true,
      data: availability
    });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
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
    if (availability.teacher.toString() !== req.user.id) {
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

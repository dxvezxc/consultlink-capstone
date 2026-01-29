const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get current user's appointments (alias for GET /)
router.get('/my', async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log('Fetching appointments for user:', {
      userId,
      userRole
    });

    let query = {};
    if (userRole === 'student') {
      query = { student: userId };
    } else if (userRole === 'teacher') {
      query = { teacher: userId };
    }

    const appointments = await Appointment.find(query)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('subject', 'name code')
      .sort({ dateTime: -1 });

    console.log('Found appointments:', appointments.length);
    if (appointments.length > 0) {
      console.log('First appointment:', appointments[0]);
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error('Get my appointments error:', err.message);
    res.status(500).json({ success: false, error: 'Error fetching appointments', message: err.message });
  }
});

// Get all appointments for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log('GET /consultations - User info:', {
      userId,
      userRole,
      userEmail: req.user.email
    });

    let query = {};
    if (userRole === 'student') {
      query = { student: userId };
    } else if (userRole === 'teacher') {
      query = { teacher: userId };
    }

    console.log('Query:', query);

    const appointments = await Appointment.find(query)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('subject', 'name code')
      .sort({ dateTime: -1 });

    console.log('Found appointments:', {
      count: appointments.length,
      query: query,
      appointments: appointments.map(a => ({
        _id: a._id,
        student: a.student?.name,
        teacher: a.teacher?.name,
        subject: a.subject?.name,
        status: a.status,
        dateTime: a.dateTime
      }))
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      consultations: appointments
    });
  } catch (err) {
    console.error('Get consultations error:', err.message);
    res.status(500).json({ success: false, error: 'Error fetching consultations', message: err.message });
  }
});

// Get single consultation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('subject', 'name code');

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Verify user is part of consultation
    const isParticipant = 
      appointment.student._id.toString() === userId.toString() || 
      appointment.teacher._id.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this appointment' });
    }

    res.status(200).json({
      success: true,
      consultation: appointment
    });
  } catch (err) {
    console.error('Get consultation error:', err.message);
    res.status(500).json({ success: false, error: 'Error fetching consultation', message: err.message });
  }
});

// Create appointment (student)
router.post('/', async (req, res) => {
  try {
    const { teacherId, subjectId, dateTime, notes } = req.body;
    const studentId = req.user._id;

    console.log('Creating appointment:', {
      studentId,
      teacherId,
      subjectId,
      dateTime
    });

    // Validate required fields
    if (!teacherId || !subjectId || !dateTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const appointment = new Appointment({
      student: studentId,
      teacher: teacherId,
      subject: subjectId,
      dateTime,
      notes: notes || '',
      status: 'pending'
    });

    await appointment.save();
    console.log('Appointment saved:', appointment._id);
    
    await appointment.populate([
      { path: 'student', select: 'name email' },
      { path: 'teacher', select: 'name email' },
      { path: 'subject', select: 'name' }
    ]);
    await appointment.populate('teacher', 'name email');
    await appointment.populate('subject', 'name');

    console.log('Appointment populated:', appointment);

    res.status(201).json({
      success: true,
      consultation: appointment,
      message: 'Appointment created successfully'
    });
  } catch (err) {
    console.error('Create appointment error:', err.message);
    res.status(500).json({ success: false, error: 'Error creating appointment', message: err.message });
  }
});

// Confirm appointment (teacher)
router.put('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Only teacher can confirm
    if (appointment.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to confirm this appointment' });
    }

    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();

    await appointment.save();
    await appointment.populate('student', 'name email');
    await appointment.populate('teacher', 'name email');

    res.status(200).json({
      success: true,
      consultation: appointment,
      message: 'Appointment confirmed'
    });
  } catch (err) {
    console.error('Confirm appointment error:', err.message);
    res.status(500).json({ success: false, error: 'Error confirming appointment', message: err.message });
  }
});

// Cancel appointment (teacher/student)
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Only teacher or student can cancel
    if (appointment.teacher.toString() !== userId.toString() && appointment.student.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'canceled';
    appointment.cancelReason = reason || '';
    appointment.canceledAt = new Date();

    await appointment.save();
    await appointment.populate('student', 'name email');

    res.status(200).json({
      success: true,
      consultation: appointment,
      message: 'Appointment canceled'
    });
  } catch (err) {
    console.error('Cancel appointment error:', err.message);
    res.status(500).json({ success: false, error: 'Error canceling appointment', message: err.message });
  }
});

// Complete appointment (teacher)
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { feedback } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Only teacher can complete
    if (appointment.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    appointment.status = 'completed';
    appointment.completedAt = new Date();
    appointment.feedback = feedback || '';
    await appointment.save();

    res.status(200).json({
      success: true,
      consultation: appointment,
      message: 'Appointment marked as completed'
    });
  } catch (err) {
    console.error('Complete appointment error:', err.message);
    res.status(500).json({ success: false, error: 'Error completing appointment', message: err.message });
  }
});

module.exports = router;

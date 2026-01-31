const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const User = require('../models/User');
const Subject = require('../models/Subject');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get current user's appointments (alias for GET /)
router.get('/my', asyncHandler(async (req, res) => {
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
}));

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

// Helper function to validate if appointment time is within teacher's availability
const validateAppointmentTime = async (teacherId, subjectId, appointmentDateTime) => {
  const appointmentDate = new Date(appointmentDateTime);
  const dayOfWeek = appointmentDate.getDay();
  const hours = String(appointmentDate.getHours()).padStart(2, '0');
  const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
  const appointmentTime = `${hours}:${minutes}`;

  // Find availability slot for this teacher on this day
  const availabilitySlot = await Availability.findOne({
    teacher: teacherId,
    subject: subjectId,
    dayOfWeek: dayOfWeek,
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: { $gte: appointmentDate } }
    ]
  });

  if (!availabilitySlot) {
    return {
      valid: false,
      message: `Teacher has no availability set for ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`
    };
  }

  // Check if appointment time falls within the slot's time range
  if (appointmentTime < availabilitySlot.startTime || appointmentTime >= availabilitySlot.endTime) {
    return {
      valid: false,
      message: `Appointment time must be between ${availabilitySlot.startTime} and ${availabilitySlot.endTime}`
    };
  }

  // Check for existing appointments in the same slot
  const existingAppointment = await Appointment.findOne({
    teacher: teacherId,
    subject: subjectId,
    dateTime: {
      $gte: new Date(appointmentDateTime),
      $lt: new Date(new Date(appointmentDateTime).getTime() + availabilitySlot.slotDuration * 60000)
    }
  });

  if (existingAppointment) {
    return {
      valid: false,
      message: 'This time slot is already booked'
    };
  }

  return { valid: true };
};

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

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    // Validate appointment time against teacher availability
    const validationResult = await validateAppointmentTime(teacherId, subjectId, dateTime);
    if (!validationResult.valid) {
      return res.status(400).json({ success: false, error: validationResult.message });
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

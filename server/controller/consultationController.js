// Consultation Controller
// Handles consultation/appointment operations

const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const User = require('../models/User');
const Subject = require('../models/Subject');

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

// Create consultation (now using Appointment model)
exports.createConsultation = async (req, res) => {
  try {
    const { teacherId, subjectId, dateTime, notes } = req.body;

    // Validate required fields
    if (!teacherId || !subjectId || !dateTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // Validate appointment time against teacher availability
    const validationResult = await validateAppointmentTime(teacherId, subjectId, dateTime);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.message
      });
    }

    const appointment = await Appointment.create({
      student: req.user._id,
      teacher: teacherId,
      subject: subjectId,
      dateTime: new Date(dateTime),
      notes: notes || '',
      status: 'pending'
    });

    await appointment.populate(['student', 'teacher', 'subject']);

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating consultation',
      error: error.message
    });
  }
};

// Get all consultations (Admin/Teacher view)
exports.getAllConsultations = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};

    if (status) filter.status = status;

    // Teachers see only their consultations
    if (req.user.role === 'teacher') {
      filter.teacher = req.user.userId;
    }

    const consultations = await Consultation.find(filter)
      .populate('student', 'name email studentID')
      .populate('teacher', 'name email')
      .populate('subject', 'name code')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultations',
      error: error.message
    });
  }
};

// Get user consultations
exports.getUserConsultations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, role } = req.query;

    const filter = {
      $or: [
        { student: userId },
        { teacher: userId }
      ]
    };

    if (status) filter.status = status;

    const consultations = await Consultation.find(filter)
      .populate('student', 'name email studentID')
      .populate('teacher', 'name email')
      .populate('subject', 'name code')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultations',
      error: error.message
    });
  }
};

// Get consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('student', 'name email studentID')
      .populate('teacher', 'name email')
      .populate('subject', 'name code')
      .populate('messages');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation',
      error: error.message
    });
  }
};

// Update consultation
exports.updateConsultation = async (req, res) => {
  try {
    const { title, description, scheduledDate, startTime, endTime, location, meetingLink, notes } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (scheduledDate) updates.scheduledDate = new Date(scheduledDate);
    if (startTime) updates.startTime = startTime;
    if (endTime) updates.endTime = endTime;
    if (location) updates.location = location;
    if (meetingLink) updates.meetingLink = meetingLink;
    if (notes) updates.notes = notes;

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate(['student', 'teacher', 'subject']);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating consultation',
      error: error.message
    });
  }
};

// Approve consultation
exports.approveConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedAt: new Date(),
        chatEnabled: true
      },
      { new: true }
    ).populate(['student', 'teacher', 'subject']);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation approved successfully',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving consultation',
      error: error.message
    });
  }
};

// Reject consultation
exports.rejectConsultation = async (req, res) => {
  try {
    const { reason } = req.body;

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        notes: reason || ''
      },
      { new: true }
    ).populate(['student', 'teacher', 'subject']);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation rejected successfully',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting consultation',
      error: error.message
    });
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate(['student', 'teacher', 'subject']);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation cancelled successfully',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling consultation',
      error: error.message
    });
  }
};

// Mark consultation as completed
exports.completeConsultation = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        endedAt: new Date(),
        rating: rating || null,
        feedback: feedback || ''
      },
      { new: true }
    ).populate(['student', 'teacher', 'subject']);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation marked as completed',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing consultation',
      error: error.message
    });
  }
};

// Delete consultation
exports.deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting consultation',
      error: error.message
    });
  }
};

// Availability Controller
// Handles teacher availability schedule operations

const Availability = require('../models/Availability');
const User = require('../models/User');
const Subject = require('../models/Subject');

// Create availability slot
exports.createAvailability = async (req, res) => {
  try {
    const { subjectId, dayOfWeek, startTime, endTime, slotDuration, validUntil } = req.body;

    // Validate required fields
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Validate day of week
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week (0-6)'
      });
    }

    const availability = await Availability.create({
      teacher: req.user.userId,
      subject: subjectId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration: slotDuration || 30,
      validUntil: validUntil || null
    });

    await availability.populate(['teacher', 'subject']);

    res.status(201).json({
      success: true,
      message: 'Availability slot created successfully',
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating availability slot',
      error: error.message
    });
  }
};

// Get all availability slots
exports.getAllAvailability = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.query;
    const filter = {};

    if (teacherId) filter.teacher = teacherId;
    if (subjectId) filter.subject = subjectId;

    const availability = await Availability.find(filter)
      .populate('teacher', 'name email')
      .populate('subject', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: error.message
    });
  }
};

// Get my availability (Teacher)
exports.getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ teacher: req.user.userId })
      .populate('subject', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your availability',
      error: error.message
    });
  }
};

// Get teacher availability by subject
exports.getTeacherAvailabilityBySubject = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;

    const availability = await Availability.find({
      teacher: teacherId,
      subject: subjectId
    }).populate('subject', 'name code');

    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher availability',
      error: error.message
    });
  }
};

// Update availability slot
exports.updateAvailability = async (req, res) => {
  try {
    const { startTime, endTime, slotDuration, validUntil } = req.body;
    const updates = {};

    if (startTime) updates.startTime = startTime;
    if (endTime) updates.endTime = endTime;
    if (slotDuration) updates.slotDuration = slotDuration;
    if (validUntil) updates.validUntil = validUntil;

    const availability = await Availability.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate(['teacher', 'subject']);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message
    });
  }
};

// Delete availability slot
exports.deleteAvailability = async (req, res) => {
  try {
    const availability = await Availability.findByIdAndDelete(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting availability',
      error: error.message
    });
  }
};

// Get available time slots for a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { teacherId, subjectId, date } = req.query;

    if (!teacherId || !subjectId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameters'
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const slots = await Availability.find({
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
      slots: slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};

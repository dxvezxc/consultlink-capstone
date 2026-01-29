// Admin Controller
// Handles admin-specific operations

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const totalSubjects = await Subject.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          teachers: totalTeachers,
          admins: totalAdmins
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments
        },
        subjects: totalSubjects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get all users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('subjects', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Create user (Admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, studentID } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || null,
      studentID: studentID || null
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, isActive } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (department) updates.department = department;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Get all consultations (Admin)
exports.getAllConsultations = async (req, res) => {
  try {
    const { status, teacherId, studentId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (teacherId) filter.teacher = teacherId;
    if (studentId) filter.student = studentId;

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

// Get system activity report
exports.getActivityReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const newUsers = await User.countDocuments({
      createdAt: filter.createdAt || { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const newConsultations = await Consultation.countDocuments({
      createdAt: filter.createdAt || { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const completedConsultations = await Consultation.countDocuments({
      status: 'completed',
      endedAt: filter.createdAt || { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        newUsers,
        newConsultations,
        completedConsultations,
        period: startDate && endDate ? { startDate, endDate } : 'Last 30 days'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity report',
      error: error.message
    });
  }
};

// Send notification to all users
exports.sendBroadcastNotification = async (req, res) => {
  try {
    const { title, message, type = 'system' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const users = await User.find({ isActive: true });
    const notifications = users.map(user => ({
      user: user._id,
      type,
      title,
      message,
      isRead: false
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending broadcast notification',
      error: error.message
    });
  }
};

// Get top-rated teachers
exports.getTopTeachers = async (req, res) => {
  try {
    const topTeachers = await Consultation.aggregate([
      { $match: { status: 'completed', rating: { $exists: true, $ne: null } } },
      { $group: {
          _id: '$teacher',
          averageRating: { $avg: '$rating' },
          consultationCount: { $sum: 1 }
        }
      },
      { $sort: { averageRating: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: topTeachers.length,
      data: topTeachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top teachers',
      error: error.message
    });
  }
};

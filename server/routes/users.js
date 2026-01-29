const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// ====== SPECIFIC ROUTES (Must come before generic :id routes) ======

// @desc    Get all teachers
// @route   GET /api/users/teachers/all
// @access  Public
router.get('/teachers/all', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('name email studentID role subjects')
      .populate('subjects', 'name description');
    
    res.json(teachers);
  } catch (err) {
    console.error('Get teachers error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @desc    Get teachers by role
// @route   GET /api/users/role/teachers
// @access  Public
router.get('/role/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (err) {
    console.error('Get teachers error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Add subject to teacher's subjects
// @route   POST /api/users/:id/subjects
// @access  Private
router.post('/:id/subjects', protect, async (req, res) => {
  try {
    // Users can only update their own profile unless admin
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const paramId = req.params.id;
    
    if (userId !== paramId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { subjectId } = req.body;
    
    if (!subjectId) {
      return res.status(400).json({ success: false, error: 'Subject ID is required' });
    }

    const user = await User.findById(paramId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if subject already exists in user's subjects array
    const subjectExists = user.subjects.some(s => s.toString() === subjectId);
    if (subjectExists) {
      return res.status(400).json({ success: false, error: 'Subject already selected' });
    }

    // Add subject to user's subjects array
    user.subjects.push(subjectId);
    await user.save();

    // Populate subjects before returning
    await user.populate('subjects', 'name code description department');

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Add subject error:', err);
    res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
});

// @desc    Remove subject from teacher's subjects
// @route   DELETE /api/users/:id/subjects/:subjectId
// @access  Private
router.delete('/:id/subjects/:subjectId', protect, async (req, res) => {
  try {
    // Users can only update their own profile unless admin
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const paramId = req.params.id;
    
    if (userId !== paramId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { id, subjectId } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove subject from user's subjects array
    user.subjects = user.subjects.filter(subject => subject.toString() !== subjectId);
    await user.save();

    // Populate subjects before returning
    await user.populate('subjects', 'name code description department');

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Remove subject error:', err);
    res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
});

// ====== GENERIC ROUTES (Must come after specific routes) ======

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Create user (register)
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, studentID } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role: role || 'student',
      studentID
    });

    await user.save();

    // Don't return password
    user = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subjects', 'name code description department');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    // Users can only update their own profile unless admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    const { name, email, subjects } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (subjects) updateData.subjects = subjects;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('subjects');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

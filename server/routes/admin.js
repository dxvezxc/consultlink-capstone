const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware: auth + admin-only
router.use(protect);
router.use(authorize('admin'));

// Helper: generate secure password
const generatePassword = () => crypto.randomBytes(6).toString('base64');

// ==========================
// TEACHER CRUD
// ==========================

// READ all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).populate('subjects');
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE teacher
router.post('/teachers', async (req, res) => {
  try {
    const { name, email, subjects } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ msg: 'Name and email are required' });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Teacher already exists' });

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const teacher = new User({
      name,
      email,
      role: 'teacher',
      subjects: (subjects || []).filter(id => id).map(id => new mongoose.Types.ObjectId(id)),
      password: hashedPassword
    });

    await teacher.save();
    const populatedTeacher = await teacher.populate('subjects');

    res.json({
      msg: 'Teacher account created',
      teacher: populatedTeacher,
      generatedPassword: plainPassword
    });
  } catch (err) {
    console.error('Teacher creation error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// UPDATE teacher (name, email, subjects)
router.put('/teachers/:id', async (req, res) => {
  try {
    const { name, email, subjects } = req.body;

    const teacher = await User.findById(req.params.id);
    if (!teacher) return res.status(404).json({ msg: 'Teacher not found' });

    teacher.name = name || teacher.name;
    teacher.email = email || teacher.email;

    if (subjects && Array.isArray(subjects)) {
      teacher.subjects = subjects.filter(id => id).map(id => new mongoose.Types.ObjectId(id));
    }

    await teacher.save();
    const populatedTeacher = await teacher.populate('subjects');

    res.json(populatedTeacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// RESET teacher password
router.put('/teachers/:id/reset-password', async (req, res) => {
  try {
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });

    res.json({ msg: 'Password reset', newPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE teacher
router.delete('/teachers/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Teacher deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==========================
// SUBJECT CRUD
// ==========================

// READ all subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().populate('consultants');
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE subject
router.post('/subjects', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ msg: 'Subject name is required' });
    }
    
    const subject = new Subject({ 
      name,
      consultants: []
    });
    await subject.save();
    const populatedSubject = await subject.populate('consultants');
    res.json(populatedSubject);
  } catch (err) {
    console.error('Subject creation error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// UPDATE subject
router.put('/subjects/:id', async (req, res) => {
  try {
    const { name, consultants } = req.body;
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ msg: 'Subject not found' });

    subject.name = name || subject.name;
    if (consultants && Array.isArray(consultants)) {
      subject.consultants = consultants.filter(id => id).map(id => new mongoose.Types.ObjectId(id));
    }

    await subject.save();
    const populatedSubject = await subject.populate('consultants');
    res.json(populatedSubject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE subject
router.delete('/subjects/:id', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Subject deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
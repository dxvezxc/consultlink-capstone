const express = require('express'); 
const Subject = require('../models/Subject');
const User = require('../models/User');
const router = express.Router();

// Debug endpoint - shows all teachers and their subjects
router.get('/debug/teachers-subjects', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('name email studentID subjects _id');
    
    console.log('=== DEBUG: Teachers and Subjects ===');
    console.log('Total teachers:', teachers.length);
    teachers.forEach(teacher => {
      console.log(`Teacher: ${teacher.name} (${teacher._id}), Subjects count: ${teacher.subjects?.length || 0}`);
      if (teacher.subjects?.length > 0) {
        console.log(`  Subjects:`, teacher.subjects);
      }
    });
    
    res.json({
      totalTeachers: teachers.length,
      teachers: teachers.map(t => ({
        _id: t._id,
        name: t.name,
        subjects: t.subjects
      }))
    });
  } catch (err) {
    console.error('Debug error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET all subjects with teachers who teach them
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find();
    console.log('Total subjects found:', subjects.length);
    
    // For each subject, find teachers who have this subject in their subjects array
    const subjectsWithTeachers = await Promise.all(
      subjects.map(async (subject) => {
        console.log(`Finding teachers for subject: ${subject.name} (${subject._id})`);
        
        const teachers = await User.find(
          { subjects: subject._id, role: 'teacher' },
          'name studentID role email _id'
        );
        
        console.log(`Found ${teachers.length} teachers for ${subject.name}`);
        
        return {
          ...subject.toObject(),
          consultants: teachers
        };
      })
    );
    
    console.log('Returning subjects with teachers:', subjectsWithTeachers.length);
    res.json(subjectsWithTeachers);
  } catch (err) {
    console.error('Get subjects error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// GET single subject with teachers
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found' });
    }
    
    console.log(`Finding teachers for subject: ${subject.name} (${subject._id})`);
    
    // Find teachers who have this subject
    const teachers = await User.find(
      { subjects: subject._id, role: 'teacher' },
      'name studentID role email _id'
    );
    
    console.log(`Found ${teachers.length} teachers for ${subject.name}`);
    
    res.json({
      ...subject.toObject(),
      consultants: teachers
    });
  } catch (err) {
    console.error('Get subject error:', err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// POST a new subject
router.post('/', async (req, res) => {
  try {
    const { name, code, description, department, consultants } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ msg: 'Subject name is required' });
    }
    
    // Create subject with only valid fields
    const subject = new Subject({
      name: name.trim(),
      code: (code || name).trim().toUpperCase(),
      description: description ? description.trim() : '',
      department: department || '',
      consultants: (consultants || []),
      isActive: true
    });
    
    const savedSubject = await subject.save();
    const populated = await Subject.findById(savedSubject._id).populate('consultants', 'name studentID role email');
    
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create subject error:', err);
    
    // Handle duplicate code error
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Subject code already exists' });
    }
    
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    const { name, code, description, department, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = code.trim().toUpperCase();
    if (description !== undefined) updateData.description = description.trim();
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('consultants', 'name studentID role email');
    
    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (err) {
    console.error('Update subject error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Subject code already exists' });
    }
    
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found' });
    }
    
    res.json({ msg: 'Subject deleted successfully', data: subject });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
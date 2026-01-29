// Subject Controller
// Handles subject management operations

const Subject = require('../models/Subject');
const User = require('../models/User');

// Create subject (Admin)
exports.createSubject = async (req, res) => {
  try {
    const { code, name, description, department } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required'
      });
    }

    const subject = await Subject.create({
      code: code || null,
      name,
      description: description || '',
      department: department || null,
      consultants: []
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message
    });
  }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const { department, isActive } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subjects = await Subject.find(filter)
      .populate('consultants', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('consultants', 'name email department');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message
    });
  }
};

// Update subject (Admin)
exports.updateSubject = async (req, res) => {
  try {
    const { code, name, description, department, isActive } = req.body;
    const updates = {};

    if (code) updates.code = code;
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (department) updates.department = department;
    if (isActive !== undefined) updates.isActive = isActive;

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('consultants', 'name email');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: error.message
    });
  }
};

// Add consultant to subject
exports.addConsultant = async (req, res) => {
  try {
    const { consultantId } = req.body;

    if (!consultantId) {
      return res.status(400).json({
        success: false,
        message: 'Consultant ID is required'
      });
    }

    // Check if consultant exists and is a teacher
    const consultant = await User.findById(consultantId);
    if (!consultant || consultant.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if consultant already exists
    if (subject.consultants.includes(consultantId)) {
      return res.status(400).json({
        success: false,
        message: 'Consultant already assigned to this subject'
      });
    }

    subject.consultants.push(consultantId);
    await subject.save();

    await subject.populate('consultants', 'name email');

    res.status(200).json({
      success: true,
      message: 'Consultant added successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding consultant',
      error: error.message
    });
  }
};

// Remove consultant from subject
exports.removeConsultant = async (req, res) => {
  try {
    const { consultantId } = req.body;

    if (!consultantId) {
      return res.status(400).json({
        success: false,
        message: 'Consultant ID is required'
      });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    subject.consultants = subject.consultants.filter(
      id => id.toString() !== consultantId
    );
    await subject.save();

    await subject.populate('consultants', 'name email');

    res.status(200).json({
      success: true,
      message: 'Consultant removed successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing consultant',
      error: error.message
    });
  }
};

// Get consultants for a subject
exports.getConsultants = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('consultants', 'name email department');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      count: subject.consultants.length,
      data: subject.consultants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consultants',
      error: error.message
    });
  }
};

// Delete subject (Admin)
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting subject',
      error: error.message
    });
  }
};

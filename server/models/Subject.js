// server/models/Subject.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  department: String,
  consultants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Subject', SubjectSchema);
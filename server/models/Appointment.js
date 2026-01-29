const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  dateTime: { 
    type: Date, 
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'canceled'], 
    default: 'pending',
    index: true
  },
  notes: { 
    type: String,
    default: '' 
  },
  feedback: { 
    type: String,
    default: '' 
  },
  cancelReason: { 
    type: String,
    default: '' 
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  canceledAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Compound index for checking conflicts
appointmentSchema.index({ teacher: 1, dateTime: 1, status: 1 });
// Index for student queries
appointmentSchema.index({ student: 1, status: 1, dateTime: 1 });
// Index for teacher queries
appointmentSchema.index({ teacher: 1, status: 1, dateTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
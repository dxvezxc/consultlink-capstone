// server/models/Availability.js
const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Please specify a subject']
  },
  dayOfWeek: {
    type: Number, // 0=Sunday, 1=Monday, ..., 6=Saturday
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String, // Format "HH:MM" in 24h, e.g., "14:30"
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  endTime: {
    type: String,
    required: true
  },
  slotDuration: {
    type: Number, // in minutes
    default: 30,
    min: 15,
    max: 120
  },
  maxCapacity: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date
}, {
  timestamps: true
});

// Compound index to prevent duplicate slots for same teacher
AvailabilitySchema.index(
  { teacher: 1, subject: 1, dayOfWeek: 1, startTime: 1, endTime: 1 },
  { unique: true, name: 'unique_availability_slot' }
);

module.exports = mongoose.model('Availability', AvailabilitySchema);
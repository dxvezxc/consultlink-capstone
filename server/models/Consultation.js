const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 60
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    consultationType: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'online'
    },
    location: {
      type: String,
      default: null
    },
    meetingLink: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: null
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    },
    messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }],
    chatEnabled: {
      type: Boolean,
      default: false
    },
    videoCallEnabled: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
consultationSchema.index({ student: 1, teacher: 1 });
consultationSchema.index({ status: 1, scheduledDate: 1 });
consultationSchema.index({ scheduledDate: 1 });

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;

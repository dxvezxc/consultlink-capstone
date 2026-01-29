// Validation Service
// Provides validation utilities for data validation

const validators = {
  // Validate email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword: (password) => {
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { valid: true };
  },

  // Validate student ID format (YY-XXXX-XXX)
  validateStudentID: (studentID) => {
    const idRegex = /^\d{2}-\d{4}-\d{3}$/;
    return idRegex.test(studentID);
  },

  // Validate time format (HH:MM in 24-hour)
  validateTime: (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  // Compare times (return true if endTime > startTime)
  compareTime: (startTime, endTime) => {
    return endTime > startTime;
  },

  // Validate date is in future
  validateFutureDate: (date) => {
    const selectedDate = new Date(date);
    return selectedDate > new Date();
  },

  // Validate consultation duration
  validateDuration: (duration) => {
    return duration > 0 && duration <= 480; // Max 8 hours
  },

  // Validate day of week (0-6)
  validateDayOfWeek: (dayOfWeek) => {
    return dayOfWeek >= 0 && dayOfWeek <= 6;
  },

  // Validate role
  validateRole: (role) => {
    return ['student', 'teacher', 'admin'].includes(role);
  },

  // Validate consultation status
  validateConsultationStatus: (status) => {
    return ['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status);
  },

  // Validate rating (0-5)
  validateRating: (rating) => {
    return rating >= 0 && rating <= 5;
  },

  // Validate consultation type
  validateConsultationType: (type) => {
    return ['online', 'offline', 'hybrid'].includes(type);
  },

  // Validate name
  validateName: (name) => {
    return name && name.trim().length > 0 && name.trim().length <= 100;
  },

  // Validate description
  validateDescription: (description) => {
    return !description || description.trim().length <= 500;
  },

  // Validate URL
  validateURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Validate phone number
  validatePhoneNumber: (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
};

module.exports = validators;

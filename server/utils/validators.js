// Validators Utility
// Common validation functions for the server

// Validate required fields
const validateRequired = (fields, data) => {
  const missing = [];

  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  });

  return {
    isValid: missing.length === 0,
    missing
  };
};

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  return {
    isValid: Object.values(requirements).every(r => r === true),
    requirements
  };
};

// Validate student ID format (YY-XXXX-XXX)
const validateStudentID = (studentID) => {
  const idRegex = /^\d{2}-\d{4}-\d{3}$/;
  return idRegex.test(studentID);
};

// Validate phone number
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Validate URL
const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate time format (HH:MM)
const validateTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Validate time is after another time
const validateTimeAfter = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  return endTotalMins > startTotalMins;
};

// Validate date is in future
const validateFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Validate date range
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

// Validate enum value
const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// Validate role
const validateRole = (role) => {
  return validateEnum(role, ['student', 'teacher', 'admin']);
};

// Validate consultation status
const validateConsultationStatus = (status) => {
  return validateEnum(status, ['pending', 'approved', 'rejected', 'completed', 'cancelled']);
};

// Validate consultation type
const validateConsultationType = (type) => {
  return validateEnum(type, ['online', 'offline', 'hybrid']);
};

// Validate day of week (0-6)
const validateDayOfWeek = (day) => {
  return Number.isInteger(day) && day >= 0 && day <= 6;
};

// Validate rating (0-5)
const validateRating = (rating) => {
  return Number.isInteger(rating) && rating >= 0 && rating <= 5;
};

// Validate duration in minutes
const validateDuration = (duration) => {
  return Number.isInteger(duration) && duration > 0 && duration <= 480;
};

// Validate string length
const validateStringLength = (str, minLength = 1, maxLength = 500) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= minLength && length <= maxLength;
};

// Validate array not empty
const validateArrayNotEmpty = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

// Validate MongoDB ObjectId
const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Sanitize string (basic HTML escape)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return str.replace(/[&<>"']/g, m => map[m]);
};

// Validate input object
const validateInput = (data, schema) => {
  const errors = [];

  Object.keys(schema).forEach(field => {
    const rule = schema[field];
    const value = data[field];

    if (rule.required && !value) {
      errors.push(`${field} is required`);
      return;
    }

    if (value) {
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`);
      }

      if (rule.validator && !rule.validator(value)) {
        errors.push(rule.message || `${field} is invalid`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  validateStudentID,
  validatePhoneNumber,
  validateURL,
  validateTimeFormat,
  validateTimeAfter,
  validateFutureDate,
  validateDateRange,
  validateEnum,
  validateRole,
  validateConsultationStatus,
  validateConsultationType,
  validateDayOfWeek,
  validateRating,
  validateDuration,
  validateStringLength,
  validateArrayNotEmpty,
  validateObjectId,
  sanitizeString,
  validateInput
};

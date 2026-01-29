// Form Validators
// Client-side validation functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
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
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  return { valid: true };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateStudentID = (studentID) => {
  const idRegex = /^\d{2}-\d{4}-\d{3}$/;
  return idRegex.test(studentID);
};

export const validateName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 100;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength;
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateTime = (timeString) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

export const validateDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  } catch {
    return false;
  }
};

export const validateFutureDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date > new Date();
  } catch {
    return false;
  }
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};

export const validateFileType = (file, allowedTypes = []) => {
  return allowedTypes.includes(file.type);
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];

    if (rule.required && !validateRequired(value)) {
      errors[field] = 'This field is required';
    } else if (value) {
      if (rule.validate && !rule.validate(value)) {
        errors[field] = rule.errorMessage || `${field} is invalid`;
      }

      if (rule.minLength && !validateMinLength(value, rule.minLength)) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && !validateMaxLength(value, rule.maxLength)) {
        errors[field] = `${field} must be at most ${rule.maxLength} characters`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getErrorMessage = (field, error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return `${field} is invalid`;
};

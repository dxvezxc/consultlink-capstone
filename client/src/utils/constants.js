// Constants
// Application-wide constants

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

export const CONSULTATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const CONSULTATION_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HYBRID: 'hybrid'
};

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const NOTIFICATION_TYPES = {
  CONSULTATION_APPROVED: 'consultation_approved',
  CONSULTATION_REJECTED: 'consultation_rejected',
  CONSULTATION_REMINDER: 'consultation_reminder',
  NEW_MESSAGE: 'new_message',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
};

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const SLOT_DURATIONS = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 }
];

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_LIMIT = 20;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters with letters, numbers, and special characters',
  INVALID_STUDENT_ID: 'Invalid student ID format (YY-XXXX-XXX)',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'An error occurred. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your connection'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful! Welcome to ConsultLink',
  PROFILE_UPDATED: 'Profile updated successfully',
  CONSULTATION_CREATED: 'Consultation request created successfully',
  CONSULTATION_APPROVED: 'Consultation approved successfully',
  CONSULTATION_REJECTED: 'Consultation rejected',
  CONSULTATION_CANCELLED: 'Consultation cancelled',
  AVAILABILITY_SAVED: 'Availability saved successfully',
  NOTIFICATION_SENT: 'Notification sent successfully'
};

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500
};

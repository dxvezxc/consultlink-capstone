// Helper Functions
// Utility functions used throughout the application

// Format date to readable string
const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Format date and time
const formatDateTime = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Format time from HH:MM format
const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Get day name from day of week number
const getDayName = (dayOfWeek) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
};

// Calculate time difference in minutes
const calculateTimeDifference = (startTime, endTime) => {
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  
  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;
  
  return endTotalMins - startTotalMins;
};

// Check if time is in past
const isTimePast = (date, time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const consultationTime = new Date(date);
  consultationTime.setHours(hours, minutes, 0);
  
  return consultationTime < new Date();
};

// Generate random token
const generateRandomToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Truncate string to specific length
const truncateString = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

// Convert hours to readable format
const hoursToReadable = (hours) => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minutes`;
  }
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
};

// Check if email is valid
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Capitalize first letter
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get status badge color
const getStatusColor = (status) => {
  const colors = {
    'pending': 'yellow',
    'approved': 'green',
    'rejected': 'red',
    'completed': 'blue',
    'cancelled': 'gray'
  };
  return colors[status] || 'gray';
};

// Get status display text
const getStatusDisplayText = (status) => {
  const displayText = {
    'pending': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return displayText[status] || status;
};

// Parse error message
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Check if date is today
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

// Check if date is tomorrow
const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkDate = new Date(date);
  return checkDate.toDateString() === tomorrow.toDateString();
};

// Get days until event
const getDaysUntil = (date) => {
  const today = new Date();
  const eventDate = new Date(date);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Sort array by property
const sortByProperty = (array, property, ascending = true) => {
  return [...array].sort((a, b) => {
    if (ascending) {
      return a[property] > b[property] ? 1 : -1;
    }
    return a[property] < b[property] ? 1 : -1;
  });
};

// Group array by property
const groupByProperty = (array, property) => {
  return array.reduce((grouped, item) => {
    const key = item[property];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
    return grouped;
  }, {});
};

module.exports = {
  formatDate,
  formatDateTime,
  formatTime,
  getDayName,
  calculateTimeDifference,
  isTimePast,
  generateRandomToken,
  truncateString,
  hoursToReadable,
  isValidEmail,
  capitalize,
  getStatusColor,
  getStatusDisplayText,
  getErrorMessage,
  isToday,
  isTomorrow,
  getDaysUntil,
  sortByProperty,
  groupByProperty
};

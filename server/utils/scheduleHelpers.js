// Schedule Helpers
// Helper functions for scheduling and calendar operations

// Generate time slots between two times
const generateTimeSlots = (startTime, endTime, slotDuration = 30) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + slotDuration <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const min = currentMinutes % 60;
    const nextHour = Math.floor((currentMinutes + slotDuration) / 60);
    const nextMin = (currentMinutes + slotDuration) % 60;

    const slotStart = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      duration: slotDuration
    });

    currentMinutes += slotDuration;
  }

  return slots;
};

// Check if two time ranges overlap
const hasTimeConflict = (start1, end1, start2, end2) => {
  const [s1Hour, s1Min] = start1.split(':').map(Number);
  const [e1Hour, e1Min] = end1.split(':').map(Number);
  const [s2Hour, s2Min] = start2.split(':').map(Number);
  const [e2Hour, e2Min] = end2.split(':').map(Number);

  const start1Mins = s1Hour * 60 + s1Min;
  const end1Mins = e1Hour * 60 + e1Min;
  const start2Mins = s2Hour * 60 + s2Min;
  const end2Mins = e2Hour * 60 + e2Min;

  return start1Mins < end2Mins && start2Mins < end1Mins;
};

// Get next available slot
const getNextAvailableSlot = (slots, reservedSlots = []) => {
  for (const slot of slots) {
    const isReserved = reservedSlots.some(reserved =>
      hasTimeConflict(slot.startTime, slot.endTime, reserved.startTime, reserved.endTime)
    );

    if (!isReserved) {
      return slot;
    }
  }
  return null;
};

// Calculate working days between dates
const getWorkingDaysBetween = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Get business hours
const getBusinessHours = () => {
  return {
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00'
  };
};

// Add minutes to time
const addMinutesToTime = (time, minutes) => {
  const [hour, min] = time.split(':').map(Number);
  let totalMins = hour * 60 + min + minutes;

  // Handle day overflow
  if (totalMins >= 24 * 60) {
    totalMins = totalMins % (24 * 60);
  }

  const newHour = Math.floor(totalMins / 60);
  const newMin = totalMins % 60;

  return `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
};

// Subtract minutes from time
const subtractMinutesFromTime = (time, minutes) => {
  const [hour, min] = time.split(':').map(Number);
  let totalMins = hour * 60 + min - minutes;

  // Handle negative time
  if (totalMins < 0) {
    totalMins = (24 * 60) + totalMins;
  }

  const newHour = Math.floor(totalMins / 60);
  const newMin = totalMins % 60;

  return `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
};

// Get week start and end dates
const getWeekRange = (date = new Date()) => {
  const current = new Date(date);
  const first = current.getDate() - current.getDay(); // Sunday
  const last = first + 6; // Saturday

  const startDate = new Date(current.setDate(first));
  const endDate = new Date(current.setDate(last));

  return {
    startDate,
    endDate
  };
};

// Get month start and end dates
const getMonthRange = (date = new Date()) => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate,
    endDate
  };
};

// Check if time is within business hours
const isWithinBusinessHours = (time) => {
  const businessHours = getBusinessHours();
  return time >= businessHours.startTime && time <= businessHours.endTime;
};

// Get duration between times
const getDurationMinutes = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  return endTotalMins - startTotalMins;
};

// Convert minutes to hour:minute format
const minutesToTimeFormat = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Get recurrence dates
const getRecurrenceDates = (startDate, endDate, dayOfWeek) => {
  const dates = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (current.getDay() === dayOfWeek) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

module.exports = {
  generateTimeSlots,
  hasTimeConflict,
  getNextAvailableSlot,
  getWorkingDaysBetween,
  getBusinessHours,
  addMinutesToTime,
  subtractMinutesFromTime,
  getWeekRange,
  getMonthRange,
  isWithinBusinessHours,
  getDurationMinutes,
  minutesToTimeFormat,
  getRecurrenceDates
};

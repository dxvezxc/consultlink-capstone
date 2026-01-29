// Scheduling Service
// Handles scheduling and calendar operations

const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

class SchedulingService {
  // Check if a time slot is available
  static async isSlotAvailable(teacherId, date, startTime, endTime) {
    try {
      const conflicts = await Appointment.findOne({
        teacher: teacherId,
        dateTime: {
          $gte: new Date(date).setHours(0, 0, 0, 0),
          $lt: new Date(date).setHours(23, 59, 59, 999)
        },
        status: { $in: ['pending', 'confirmed', 'completed'] }
      });

      return !conflicts;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  // Get available slots for a teacher on a specific date
  static async getAvailableSlots(teacherId, subjectId, date) {
    try {
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();

      // Get teacher's availability for that day
      const availability = await Availability.find({
        teacher: teacherId,
        subject: subjectId,
        dayOfWeek: dayOfWeek,
        $or: [
          { validUntil: { $exists: false } },
          { validUntil: { $gte: selectedDate } }
        ]
      });

      if (availability.length === 0) {
        return [];
      }

      const slots = [];

      for (const slot of availability) {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);
        const slotDuration = slot.slotDuration;

        let currentStart = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        while (currentStart + slotDuration <= endTime) {
          const startHours = Math.floor(currentStart / 60);
          const startMins = currentStart % 60;
          const endHours = Math.floor((currentStart + slotDuration) / 60);
          const endMins = (currentStart + slotDuration) % 60;

          const startTimeStr = `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}`;
          const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

          // Check if slot is available
          const isAvailable = await this.isSlotAvailable(teacherId, date, startTimeStr, endTimeStr);

          if (isAvailable) {
            slots.push({
              startTime: startTimeStr,
              endTime: endTimeStr,
              duration: slotDuration
            });
          }

          currentStart += slotDuration;
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  // Generate time options for a slot
  static generateTimeOptions(slotDuration = 30) {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += slotDuration) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  }

  // Calculate consultation duration
  static calculateDuration(startTime, endTime) {
    try {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;

      return endTotalMin - startTotalMin;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  }

  // Get upcoming consultations
  static async getUpcomingConsultations(userId, limit = 10) {
    try {
      const consultations = await Consultation.find({
        $or: [
          { student: userId },
          { teacher: userId }
        ],
        scheduledDate: { $gte: new Date() },
        status: { $in: ['pending', 'approved'] }
      })
        .populate('student', 'name email')
        .populate('teacher', 'name email')
        .populate('subject', 'name code')
        .sort({ scheduledDate: 1 })
        .limit(limit);

      return consultations;
    } catch (error) {
      console.error('Error getting upcoming consultations:', error);
      return [];
    }
  }

  // Get past consultations
  static async getPastConsultations(userId, limit = 10) {
    try {
      const consultations = await Consultation.find({
        $or: [
          { student: userId },
          { teacher: userId }
        ],
        scheduledDate: { $lt: new Date() }
      })
        .populate('student', 'name email')
        .populate('teacher', 'name email')
        .populate('subject', 'name code')
        .sort({ scheduledDate: -1 })
        .limit(limit);

      return consultations;
    } catch (error) {
      console.error('Error getting past consultations:', error);
      return [];
    }
  }

  // Get consultation statistics
  static async getConsultationStats(userId) {
    try {
      const total = await Consultation.countDocuments({
        $or: [{ student: userId }, { teacher: userId }]
      });

      const completed = await Consultation.countDocuments({
        $or: [{ student: userId }, { teacher: userId }],
        status: 'completed'
      });

      const upcoming = await Consultation.countDocuments({
        $or: [{ student: userId }, { teacher: userId }],
        status: 'approved',
        scheduledDate: { $gte: new Date() }
      });

      const pending = await Consultation.countDocuments({
        $or: [{ student: userId }, { teacher: userId }],
        status: 'pending'
      });

      return { total, completed, upcoming, pending };
    } catch (error) {
      console.error('Error getting consultation stats:', error);
      return { total: 0, completed: 0, upcoming: 0, pending: 0 };
    }
  }

  // Check for scheduling conflicts
  static async findConflicts(teacherId, startDate, endDate) {
    try {
      const conflicts = await Consultation.find({
        teacher: teacherId,
        scheduledDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: { $in: ['pending', 'approved', 'completed'] }
      }).sort({ scheduledDate: 1 });

      return conflicts;
    } catch (error) {
      console.error('Error finding conflicts:', error);
      return [];
    }
  }
}

module.exports = SchedulingService;

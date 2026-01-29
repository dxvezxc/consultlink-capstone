// Report Service
// Handles report generation and analytics

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Subject = require('../models/Subject');

class ReportService {
  // Generate appointment report
  static async generateConsultationReport(filters = {}) {
    try {
      const { startDate, endDate, teacherId, studentId, status } = filters;
      const query = {};

      if (startDate && endDate) {
        query.dateTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      if (teacherId) query.teacher = teacherId;
      if (studentId) query.student = studentId;
      if (status) query.status = status;

      const appointments = await Appointment.find(query)
        .populate('student', 'name email studentID')
        .populate('teacher', 'name email')
        .populate('subject', 'name code');

      return consultations;
    } catch (error) {
      console.error('Error generating consultation report:', error);
      return [];
    }
  }

  // Generate analytics report
  static async generateAnalyticsReport(startDate, endDate) {
    try {
      const dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };

      const totalConsultations = await Consultation.countDocuments({
        scheduledDate: dateFilter
      });

      const completedConsultations = await Consultation.countDocuments({
        scheduledDate: dateFilter,
        status: 'completed'
      });

      const pendingConsultations = await Consultation.countDocuments({
        scheduledDate: dateFilter,
        status: 'pending'
      });

      const approvedConsultations = await Consultation.countDocuments({
        scheduledDate: dateFilter,
        status: 'approved'
      });

      const rejectedConsultations = await Consultation.countDocuments({
        scheduledDate: dateFilter,
        status: 'rejected'
      });

      const newUsers = await User.countDocuments({
        createdAt: dateFilter
      });

      const newStudents = await User.countDocuments({
        createdAt: dateFilter,
        role: 'student'
      });

      const newTeachers = await User.countDocuments({
        createdAt: dateFilter,
        role: 'teacher'
      });

      return {
        period: { startDate, endDate },
        consultations: {
          total: totalConsultations,
          completed: completedConsultations,
          pending: pendingConsultations,
          approved: approvedConsultations,
          rejected: rejectedConsultations
        },
        users: {
          new: newUsers,
          students: newStudents,
          teachers: newTeachers
        }
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      return null;
    }
  }

  // Generate teacher performance report
  static async generateTeacherPerformanceReport(teacherId) {
    try {
      const totalConsultations = await Consultation.countDocuments({ teacher: teacherId });

      const completedConsultations = await Consultation.countDocuments({
        teacher: teacherId,
        status: 'completed'
      });

      const ratedConsultations = await Consultation.find({
        teacher: teacherId,
        status: 'completed',
        rating: { $exists: true, $ne: null }
      });

      const averageRating = ratedConsultations.length > 0
        ? (ratedConsultations.reduce((sum, c) => sum + c.rating, 0) / ratedConsultations.length).toFixed(2)
        : 0;

      const subjectsBreakdown = await Consultation.aggregate([
        { $match: { teacher: teacherId } },
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectInfo' } }
      ]);

      return {
        teacherId,
        totalConsultations,
        completedConsultations,
        completionRate: ((completedConsultations / totalConsultations) * 100).toFixed(2) + '%',
        averageRating,
        ratedCount: ratedConsultations.length,
        subjectsBreakdown
      };
    } catch (error) {
      console.error('Error generating teacher performance report:', error);
      return null;
    }
  }

  // Generate student engagement report
  static async generateStudentEngagementReport(studentId) {
    try {
      const totalConsultations = await Consultation.countDocuments({ student: studentId });

      const completedConsultations = await Consultation.countDocuments({
        student: studentId,
        status: 'completed'
      });

      const upcomingConsultations = await Consultation.countDocuments({
        student: studentId,
        status: 'approved',
        scheduledDate: { $gte: new Date() }
      });

      const subjectsEngaged = await Consultation.distinct('subject', { student: studentId });

      const teachersEngaged = await Consultation.distinct('teacher', { student: studentId });

      return {
        studentId,
        totalConsultations,
        completedConsultations,
        upcomingConsultations,
        subjectsEngaged: subjectsEngaged.length,
        teachersEngaged: teachersEngaged.length,
        engagementScore: Math.min(100, (completedConsultations * 10 + upcomingConsultations * 5))
      };
    } catch (error) {
      console.error('Error generating student engagement report:', error);
      return null;
    }
  }

  // Generate subject popularity report
  static async generateSubjectPopularityReport(startDate, endDate) {
    try {
      const dateFilter = {
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const subjectStats = await Consultation.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$subject', consultationCount: { $sum: 1 } } },
        { $sort: { consultationCount: -1 } },
        { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectInfo' } },
        { $unwind: '$subjectInfo' }
      ]);

      return {
        period: { startDate, endDate },
        subjects: subjectStats
      };
    } catch (error) {
      console.error('Error generating subject popularity report:', error);
      return null;
    }
  }

  // Export report to JSON
  static async exportReportAsJSON(report) {
    try {
      return JSON.stringify(report, null, 2);
    } catch (error) {
      console.error('Error exporting report:', error);
      return null;
    }
  }

  // Export report to CSV
  static async exportReportAsCSV(report) {
    try {
      if (Array.isArray(report)) {
        const headers = Object.keys(report[0]).join(',');
        const rows = report.map(item => Object.values(item).join(','));
        return [headers, ...rows].join('\n');
      }
      return JSON.stringify(report);
    } catch (error) {
      console.error('Error exporting report to CSV:', error);
      return null;
    }
  }
}

module.exports = ReportService;

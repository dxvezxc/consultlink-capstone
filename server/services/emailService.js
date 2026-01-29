// Email Service
// Handles sending emails to users

const nodemailer = require('nodemailer');

// Configure your email service here
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

class EmailService {
  // Send welcome email
  static async sendWelcomeEmail(email, name) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject: 'Welcome to ConsultLink',
        html: `
          <h1>Welcome to ConsultLink, ${name}!</h1>
          <p>Your account has been created successfully.</p>
          <p>You can now log in and start booking consultations with teachers.</p>
          <br>
          <p>Best regards,<br>ConsultLink Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  // Send consultation confirmation email
  static async sendConsultationConfirmation(email, consultationDetails) {
    try {
      const { title, teacher, scheduledDate, startTime, endTime } = consultationDetails;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject: 'Consultation Confirmation',
        html: `
          <h1>Consultation Confirmed</h1>
          <p>Your consultation has been scheduled:</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Teacher:</strong> ${teacher}</li>
            <li><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
          </ul>
          <p>Please make sure to join on time.</p>
          <br>
          <p>Best regards,<br>ConsultLink Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending consultation confirmation:', error);
      return false;
    }
  }

  // Send consultation approval email
  static async sendConsultationApprovalEmail(email, consultationDetails) {
    try {
      const { title, teacher, scheduledDate, startTime, endTime, meetingLink } = consultationDetails;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject: 'Your Consultation Has Been Approved',
        html: `
          <h1>Consultation Approved!</h1>
          <p>Your consultation request has been approved.</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Teacher:</strong> ${teacher}</li>
            <li><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
            ${meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>` : ''}
          </ul>
          <p>Click the link above to join the consultation.</p>
          <br>
          <p>Best regards,<br>ConsultLink Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      return false;
    }
  }

  // Send consultation rejection email
  static async sendConsultationRejectionEmail(email, title, reason = '') {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject: 'Consultation Request Status',
        html: `
          <h1>Consultation Status Update</h1>
          <p>Your consultation request for "<strong>${title}</strong>" has been declined.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Please feel free to book another consultation.</p>
          <br>
          <p>Best regards,<br>ConsultLink Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return false;
    }
  }

  // Send consultation reminder email
  static async sendConsultationReminder(email, consultationDetails, hoursBeforeStart = 24) {
    try {
      const { title, teacher, scheduledDate, startTime } = consultationDetails;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject: `Reminder: Consultation with ${teacher} in ${hoursBeforeStart} hours`,
        html: `
          <h1>Consultation Reminder</h1>
          <p>You have an upcoming consultation:</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Teacher:</strong> ${teacher}</li>
            <li><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${startTime}</li>
          </ul>
          <p>Please be ready to join at the scheduled time.</p>
          <br>
          <p>Best regards,<br>ConsultLink Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return false;
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email, resetLink) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You have requested to reset your password.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>ConsultLink Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending reset email:', error);
      return false;
    }
  }

  // Send email verification email
  static async sendVerificationEmail(email, verificationLink) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Email Verification</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}">${verificationLink}</a>
          <p>This link will expire in 24 hours.</p>
          <br>
          <p>Best regards,<br>ConsultLink Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  // Send generic email
  static async sendEmail(email, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@consultlink.com',
        to: email,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Test email connection
  static async testConnection() {
    try {
      await transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

module.exports = EmailService;

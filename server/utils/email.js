const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({  // Corrected: 'createTransport'
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,  // Use app password for Gmail
  },
});

const sendReminder = async (to, subject, text) => {
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

module.exports = { sendReminder };
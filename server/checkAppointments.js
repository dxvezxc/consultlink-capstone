// Quick script to check appointments in database
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
const Subject = require('./models/Subject');
require('dotenv').config();

const checkAppointments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/consultlink');
    console.log('Connected to MongoDB');

    // Get all appointments
    const appointments = await Appointment.find()
      .populate('student', 'name email role')
      .populate('teacher', 'name email role')
      .populate('subject', 'name')
      .sort({ createdAt: -1 });

    console.log('\n=== ALL APPOINTMENTS ===');
    console.log('Total appointments:', appointments.length);
    
    if (appointments.length > 0) {
      appointments.forEach((apt, idx) => {
        console.log(`\n${idx + 1}. Appointment ID: ${apt._id}`);
        console.log(`   Student: ${apt.student?.name} (${apt.student?._id})`);
        console.log(`   Teacher: ${apt.teacher?.name} (${apt.teacher?._id})`);
        console.log(`   Subject: ${apt.subject?.name}`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   DateTime: ${apt.dateTime}`);
        console.log(`   Created: ${apt.createdAt}`);
      });
    } else {
      console.log('No appointments found in database');
    }

    // Check appointment count by status
    const byStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n=== APPOINTMENTS BY STATUS ===');
    byStatus.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });

    // Check appointment count by teacher
    const byTeacher = await Appointment.aggregate([
      { $group: { _id: '$teacher', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n=== APPOINTMENTS BY TEACHER ===');
    for (const item of byTeacher) {
      const teacher = await User.findById(item._id);
      console.log(`${teacher?.name} (${item._id}): ${item.count}`);
    }

    await mongoose.connection.close();
    console.log('\nDatabase check complete.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkAppointments();

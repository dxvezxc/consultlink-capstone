const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/consultlink');
    console.log('Connected to MongoDB');

    // Drop the users collection to remove old indexes
    try {
      await mongoose.connection.db.dropCollection('users');
      console.log('Dropped users collection');
    } catch (err) {
      console.log('Users collection does not exist yet');
    }

    // Drop the subjects collection
    try {
      await mongoose.connection.db.dropCollection('subjects');
      console.log('Dropped subjects collection');
    } catch (err) {
      console.log('Subjects collection does not exist yet');
    }

    // Create Admin User (no studentID needed)
    // NOTE: Password will be hashed by User model pre-save hook
    const admin = new User({
      name: 'Admin User',
      email: 'admin@consultlink.local',
      password: 'Admin@123', // Will be hashed by model - meets validation requirements
      role: 'admin'
    });
    await admin.save();
    console.log('✓ Admin created: admin@consultlink.local / Admin@123');

    // Create Sample Subjects
    const mathSubject = new Subject({ name: 'Mathematics' });
    const physicsSubject = new Subject({ name: 'Physics' });
    const chemistrySubject = new Subject({ name: 'Chemistry' });
    const englishSubject = new Subject({ name: 'English' });
    
    await mathSubject.save();
    await physicsSubject.save();
    await chemistrySubject.save();
    await englishSubject.save();
    console.log('✓ Sample subjects created');

    // Create Sample Teachers (no studentID needed)
    const teacher1 = new User({
      name: 'Dr. Smith',
      email: 'smith@example.com',
      password: 'Teacher@123', // Will be hashed by model - meets validation requirements
      role: 'teacher',
      subjects: [mathSubject._id, physicsSubject._id]
    });

    const teacher2 = new User({
      name: 'Prof. Johnson',
      email: 'johnson@example.com',
      password: 'Teacher@123', // Will be hashed by model
      role: 'teacher',
      subjects: [chemistrySubject._id]
    });

    const teacher3 = new User({
      name: 'Dr. Williams',
      email: 'williams@example.com',
      password: 'Teacher@123', // Will be hashed by model
      role: 'teacher',
      subjects: [englishSubject._id]
    });

    await teacher1.save();
    await teacher2.save();
    await teacher3.save();
    console.log('✓ Sample teachers created');

    // Create Sample Students (with studentID)
    const student1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      studentID: '12-1234-123',
      password: 'Student@123', // Will be hashed by model - meets validation requirements
      role: 'student'
    });

    const student2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      studentID: '12-1234-124',
      password: 'Student@123', // Will be hashed by model
      role: 'student'
    });

    await student1.save();
    await student2.save();
    console.log('✓ Sample students created');

    console.log('\n=== Seed Complete ===');
    console.log('Login Credentials:');
    console.log('Admin: admin@consultlink.local / Admin@123');
    console.log('Teacher: smith@example.com / Teacher@123 (or Dr. Smith / Teacher@123)');
    console.log('Student: 12-1234-123 / Student@123 (or john@example.com / Student@123)');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();

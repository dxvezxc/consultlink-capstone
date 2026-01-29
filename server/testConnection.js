const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const testConnection = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✓ MongoDB Connected Successfully!');
    
    // Check if users exist
    const userCount = await User.countDocuments();
    console.log(`\nCurrent users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\nNo users found. Creating test users...');
      
      // Create test users
      const testUsers = [
        {
          name: 'Test Student',
          email: 'student@test.com',
          studentID: '12-1234-123',
          password: 'password',
          role: 'student'
        },
        {
          name: 'Dr. Smith',
          email: 'teacher@test.com',
          password: 'password',
          role: 'teacher',
          subjects: ['Mathematics', 'Physics']
        },
        {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password',
          role: 'admin'
        }
      ];
      
      for (const userData of testUsers) {
        const user = await User.create(userData);
        console.log(`✓ Created ${user.role}: ${user.name} (${user.email})`);
      }
      
      console.log('\n✓ Test users created successfully!');
    } else {
      console.log('\nExisting users:');
      const users = await User.find().select('name email role studentID');
      users.forEach(user => {
        console.log(`- ${user.role}: ${user.name} (${user.email})${user.studentID ? ` - ID: ${user.studentID}` : ''}`);
      });
    }
    
    console.log('\n✓ Database test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

testConnection();

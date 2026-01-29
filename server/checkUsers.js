// Quick script to check users in database
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/consultlink');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find()
      .select('name email role isActive')
      .sort({ createdAt: -1 });

    console.log('\n=== ALL USERS ===');
    console.log('Total users:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, idx) => {
        console.log(`\n${idx + 1}. ${user.name}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
      });
    } else {
      console.log('No users found in database');
    }

    // Count by role
    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    console.log('\n=== USERS BY ROLE ===');
    byRole.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase check complete.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUsers();

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

console.log('\n' + '='.repeat(60));
console.log('DIAGNOSTIC CHECK');
console.log('='.repeat(60));

console.log('\n1. Environment Variables:');
console.log('   MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'NOT SET');
console.log('   PORT:', process.env.PORT || '5000');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');

console.log('\n2. Attempting MongoDB Connection...');
console.log('   URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('   ✅ MongoDB Connected Successfully!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    
    console.log('\n3. Testing User Model...');
    try {
      const testUser = {
        name: 'Diagnostic Test User',
        email: `test${Date.now()}@example.com`,
        studentID: `99-9999-${Math.floor(Math.random() * 900) + 100}`,
        password: 'testpassword123',
        role: 'student'
      };
      
      console.log('   Creating test user:', testUser.email);
      const user = await User.create(testUser);
      console.log('   ✅ User created successfully!');
      console.log('   User ID:', user._id);
      
      console.log('\n4. Cleaning up test user...');
      await User.deleteOne({ _id: user._id });
      console.log('   ✅ Test user deleted');
      
      console.log('\n5. Checking existing users...');
      const userCount = await User.countDocuments();
      console.log('   Total users in database:', userCount);
      
      if (userCount > 0) {
        const users = await User.find().select('name email role studentID').limit(5);
        console.log('\n   Sample users:');
        users.forEach(u => {
          console.log(`   - ${u.role}: ${u.name} (${u.email})${u.studentID ? ` - ID: ${u.studentID}` : ''}`);
        });
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ ALL CHECKS PASSED - System is ready!');
      console.log('='.repeat(60));
      console.log('\nYou can now:');
      console.log('1. Start the server: node server.js');
      console.log('2. Test registration at: http://localhost:3000/register');
      console.log('='.repeat(60) + '\n');
      
      process.exit(0);
    } catch (error) {
      console.log('   ❌ Error testing User model:', error.message);
      console.log('\n   Full error:', error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.log('   ❌ MongoDB Connection Failed!');
    console.log('   Error:', error.message);
    
    console.log('\n' + '='.repeat(60));
    console.log('TROUBLESHOOTING STEPS:');
    console.log('='.repeat(60));
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n❌ Cannot connect to MongoDB');
      console.log('\nPossible solutions:');
      console.log('1. If using local MongoDB:');
      console.log('   - Make sure MongoDB is installed');
      console.log('   - Start MongoDB service:');
      console.log('     Windows: Services → MongoDB → Start');
      console.log('     Mac: brew services start mongodb-community');
      console.log('     Linux: sudo systemctl start mongodb');
      console.log('\n2. If using MongoDB Atlas:');
      console.log('   - Check if cluster is running (not paused)');
      console.log('   - Whitelist your IP: Network Access → Add IP → 0.0.0.0/0');
      console.log('   - Wait 2 minutes after making changes');
      console.log('\n3. Update .env file:');
      console.log('   For local: MONGO_URI=mongodb://localhost:27017/consultlink');
      console.log('   For Atlas: MONGO_URI=mongodb+srv://...');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(1);
  });

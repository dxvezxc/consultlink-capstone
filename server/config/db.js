const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    console.log(`📍 Connection string: ${process.env.ATLAS_URL.split('@')[0]}@***`); // Log without password
    
    const connection = await mongoose.connect(process.env.ATLAS_URL, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`📊 Database: ${connection.connection.name}`);
    console.log(`🌐 Host: ${connection.connection.host}`);
    console.log(`🔌 Ready State: Connected`);
    
    return connection;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB Atlas: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('🔴 Connection Refused - Possible causes:');
      console.error('   1. IP address not whitelisted in MongoDB Atlas');
      console.error('   2. Invalid username or password');
      console.error('   3. Cluster is paused or temporarily unavailable');
      console.error('\n📋 Steps to fix:');
      console.error('   1. Go to MongoDB Atlas → Network Access');
      console.error('   2. Add your IP address or "Allow Access from Anywhere" (0.0.0.0/0)');
      console.error('   3. Verify username and password in .env file');
    } else if (error.name === 'MongoNetworkError') {
      console.error('🔴 Network Error: Check your MongoDB Atlas connection');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('🔴 Authentication Error: Check your MongoDB Atlas credentials');
    } else if (error.name === 'MongoParseError') {
      console.error('🔴 Parse Error: Check your MongoDB connection string format');
    }
    
    console.log('Retrying connection in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

module.exports = connectDB;

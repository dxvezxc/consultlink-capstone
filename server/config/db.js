const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);
    
    return connection;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    if (error.name === 'MongoNetworkError') {
      console.error('Network Error: Check your MongoDB server or connection string');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('Authentication Error: Check your MongoDB credentials');
    } else if (error.name === 'MongoParseError') {
      console.error('Parse Error: Check your MongoDB connection string format');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;

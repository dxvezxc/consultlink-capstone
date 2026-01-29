const { exec } = require('child_process');
const mongoose = require('mongoose');

console.log('='.repeat(50));
console.log('MongoDB Installation Check');
console.log('='.repeat(50));

// Check if MongoDB is installed
exec('mongod --version', (error, stdout, stderr) => {
  if (error) {
    console.log('\n❌ MongoDB is NOT installed on this system');
    console.log('\nPlease install MongoDB:');
    console.log('Windows: https://www.mongodb.com/try/download/community');
    console.log('Mac: brew install mongodb-community');
    console.log('Linux: sudo apt-get install mongodb');
    console.log('\n' + '='.repeat(50));
    return;
  }
  
  console.log('\n✅ MongoDB is installed');
  console.log(stdout.split('\n')[0]); // Show version
  
  // Try to connect
  console.log('\nTrying to connect to local MongoDB...');
  
  mongoose.connect('mongodb://localhost:27017/consultlink')
    .then(() => {
      console.log('✅ Successfully connected to MongoDB!');
      console.log('Database: consultlink');
      console.log('Host: localhost:27017');
      console.log('\n' + '='.repeat(50));
      console.log('✅ Your MongoDB is ready to use!');
      console.log('='.repeat(50));
      process.exit(0);
    })
    .catch((err) => {
      console.log('❌ Could not connect to MongoDB');
      console.log('Error:', err.message);
      console.log('\nMongoDB might not be running. Try:');
      console.log('Windows: Start MongoDB service from Services');
      console.log('Mac: brew services start mongodb-community');
      console.log('Linux: sudo systemctl start mongodb');
      console.log('\n' + '='.repeat(50));
      process.exit(1);
    });
});

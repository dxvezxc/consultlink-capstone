// Test script to check if appointments are being returned for teachers
const axios = require('axios');
const jwt = require('jsonwebtoken');

const testTeacherAppointments = async () => {
  try {
    // Create a token for the teacher
    const teacherId = '6973c0b76bbbfe0ba51463b6'; // Dave D
    const token = jwt.sign(
      { _id: teacherId, role: 'teacher', email: 'dave@teacher.local' },
      process.env.JWT_SECRET || 'test-secret-key'
    );

    console.log('Test token created for teacher:', teacherId);
    console.log('Token:', token.substring(0, 50) + '...');

    // Make request to get appointments
    const response = await axios.get('http://localhost:5000/api/consultations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n=== APPOINTMENTS RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
  }
};

testTeacherAppointments();

// Validation middleware for common operations

// @desc    Validate appointment booking
const validateAppointmentBooking = (req, res, next) => {
  const { consultantId, subjectId, dateTime } = req.body;

  // Validate required fields
  if (!consultantId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Consultant ID is required' 
    });
  }

  if (!subjectId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Subject ID is required' 
    });
  }

  if (!dateTime) {
    return res.status(400).json({ 
      success: false, 
      error: 'Appointment date and time are required' 
    });
  }

  // Validate date format
  const appointmentDate = new Date(dateTime);
  if (isNaN(appointmentDate.getTime())) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid date format. Use ISO 8601 format (e.g., 2026-01-24T14:00:00Z)' 
    });
  }

  next();
};

// @desc    Validate registration input
const validateRegistration = (req, res, next) => {
  const { name, email, password, role, studentID } = req.body;

  // Validate required fields
  if (!name || !name.trim()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name is required' 
    });
  }

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required' 
    });
  }

  // Validate email format
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide a valid email address' 
    });
  }

  if (!password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password is required' 
    });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password must be at least 8 characters long' 
    });
  }

  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password must contain at least one letter' 
    });
  }

  if (!/(?=.*[0-9])/.test(password)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password must contain at least one number' 
    });
  }

  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password must contain at least one special character (!@#$%^&*)' 
    });
  }

  // Validate student ID format if provided
  if (studentID) {
    const studentIDRegex = /^\d{2}-\d{4}-\d{3}$/;
    if (!studentIDRegex.test(studentID)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID must be in format YY-XXXX-XXX (e.g., 12-1234-123)' 
      });
    }
  }

  // Validate role if provided
  if (role && !['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Role must be student, teacher, or admin' 
    });
  }

  next();
};

// @desc    Validate login input
const validateLogin = (req, res, next) => {
  const { identifier, email, password } = req.body;
  const loginIdentifier = identifier || email;

  if (!loginIdentifier) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email, student ID, or username is required' 
    });
  }

  if (!password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password is required' 
    });
  }

  next();
};

module.exports = {
  validateAppointmentBooking,
  validateRegistration,
  validateLogin
};

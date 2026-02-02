// User Controller
// Handles user-related operations

const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('subjects', 'name code')
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subjects', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('subjects', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('updateProfile: Starting...');
    console.log('updateProfile: req.user:', req.user);
    
    const { name, department, bio, experience, subjects } = req.body;
    console.log('updateProfile: Received data:', { name, department, bio, experience, subjects });
    
    const updates = {};

    if (name) updates.name = name;
    if (department) updates.department = department;
    if (bio !== undefined) updates.bio = bio;
    if (experience !== undefined) updates.experience = experience;
    
    // Handle subjects array - ensure it's an array
    if (subjects && Array.isArray(subjects)) {
      updates.subjects = subjects;
    }
    
    console.log('updateProfile: Updates object:', updates);

    // Get userId from either req.user._id or req.user.id or req.user.userId
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    
    console.log('updateProfile: userId extracted:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('updateProfile: Updating user with ID:', userId);
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password').populate('subjects', 'name code description');

    console.log('updateProfile: User after update:', user);

    if (!user) {
      console.error('updateProfile: User not found after update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('updateProfile: Updated user with subjects:', user.subjects);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    console.error('updateProfile error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Update user by ID (Admin)
exports.updateUserById = async (req, res) => {
  try {
    const { name, email, role, department, isActive } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (department) updates.department = department;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['student', 'teacher', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const users = await User.find({ role })
      .select('-password')
      .populate('subjects', 'name code')
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users by role',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║         CHANGE PASSWORD CONTROLLER - START             ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
    console.log('[1] req.user object:', req.user);
    console.log('[1a] req.user._id:', req.user?._id);
    console.log('[1b] req.user.email:', req.user?.email);
    console.log('[1c] req.user exists:', !!req.user);
    
    console.log('[2] req.body:', req.body);
    const { currentPassword, newPassword, confirmPassword } = req.body;
    console.log('[2a] currentPassword provided:', !!currentPassword);
    console.log('[2b] newPassword provided:', !!newPassword);
    console.log('[2c] confirmPassword provided:', !!confirmPassword);

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.log('[3] ❌ VALIDATION FAILED - Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all password fields'
      });
    }

    if (newPassword !== confirmPassword) {
      console.log('[4] ❌ VALIDATION FAILED - Passwords do not match');
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      console.log('[5] ❌ VALIDATION FAILED - Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get user with password field
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    console.log('[6] Extracted userId:', userId);
    console.log('[6a] userId type:', typeof userId);
    
    if (!userId) {
      console.log('[6b] ❌ NO USER ID FOUND');
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    const user = await User.findById(userId).select('+password');
    console.log('[7] User found in database:', !!user);
    console.log('[7a] User email:', user?.email);
    console.log('[7b] User has password field:', !!user?.password);

    if (!user) {
      console.log('[8] ❌ USER NOT FOUND IN DATABASE');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    console.log('[9] About to compare passwords...');
    console.log('[9a] currentPassword (hidden):', '***');
    console.log('[9b] user.password (hidden):', '***');
    
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    console.log('[10] Password comparison result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log('[11] ❌ CURRENT PASSWORD INCORRECT');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    console.log('[12] ✓ Current password verified, updating to new password...');
    user.password = newPassword;
    await user.save();
    console.log('[13] ✓ Password updated successfully in database');

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║         CHANGE PASSWORD CONTROLLER - SUCCESS           ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════╗');
    console.error('║         CHANGE PASSWORD CONTROLLER - ERROR            ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('╔════════════════════════════════════════════════════════╗');
    console.error('║         END ERROR                                      ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error('');
    
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

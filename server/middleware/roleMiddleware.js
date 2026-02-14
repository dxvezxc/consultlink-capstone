// Role-Based Access Control Middleware

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      console.log('=== AUTHORIZE MIDDLEWARE ===');
      console.log('User:', req.user?.email);
      console.log('User role:', userRole);
      console.log('Allowed roles:', allowedRoles);

      if (!userRole) {
        console.log('❌ User role not found');
        return res.status(401).json({
          success: false,
          message: 'User role not found'
        });
      }

      if (!allowedRoles.includes(userRole)) {
        console.log(`❌ Access denied. User has '${userRole}', needs one of:`, allowedRoles);
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      console.log(`✅ AUTHORIZE passed. User '${userRole}' has access`);
      next();
    } catch (error) {
      console.error('❌ Authorization error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};

module.exports = { authorize };

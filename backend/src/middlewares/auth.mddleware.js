// middleware/authMiddleware.js
import jwtService from '../services/jwtService.js';
import User from '../models/User.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = jwtService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    
    if (error.message.includes('expired') || error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Role-based access control middleware factory
export const requireRoles = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user has any of the required roles
      const hasRole = roles.some(role => 
        user.communities.some(c => c.role === role)
      );

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Role Check Error:', error);
      res.status(500).json({
        success: false,
        message: 'Role check failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// Export all middleware functions
export default {
  authenticate,
  requireRoles
};
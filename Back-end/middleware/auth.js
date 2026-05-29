// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized - user not found' 
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized - invalid token' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized - no token provided' 
    });
  }
};

// Admin only middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied - admin only' 
    });
  }
};

// Editor or Admin middleware
const editorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied - editor or admin required' 
    });
  }
};

// Check if user owns resource or is admin
const ownerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user._id.toString() === req.params.id)) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied - you can only access your own resources' 
    });
  }
};

// ASYV Items or Admin middleware - for IT Items management
const asyvItemsOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'asyv-items')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied - ASYV Items management only' 
    });
  }
};

// ASYV Items only middleware
const asyvItems = (req, res, next) => {
  if (req.user && req.user.role === 'asyv-items') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied - ASYV Items only' 
    });
  }
};

module.exports = {
  protect,
  admin,
  editorOrAdmin,
  ownerOrAdmin,
  asyvItemsOrAdmin,
  asyvItems,
  // Legacy exports for backward compatibility
  itAdminOrAdmin: asyvItemsOrAdmin,
  itAdmin: asyvItems
};
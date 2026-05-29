// controllers/userController.js - Updated with additional auth methods
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN || '1h'
  });
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, field, department, customDepartment } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate field requirement for students
    if (role === 'student' && !field) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field is required for students' 
      });
    }

    // Validate department requirement for ASYV Items users
    if (role === 'asyv-items' && !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department is required for ASYV Items users' 
      });
    }

    // Validate custom department requirement
    if (role === 'asyv-items' && department === 'custom' && !customDepartment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Custom department name is required when selecting custom department' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user data
    const userData = {
      fullName,
      email,
      password,
      role: role || 'student'
    };

    // Add field only for students
    if (role === 'student' && field) {
      userData.field = field;
    }

    // Add department for ASYV Items users
    if (role === 'asyv-items') {
      userData.department = department;
      if (department === 'custom' && customDepartment) {
        userData.customDepartment = customDepartment;
      }
    }

    const user = await User.create(userData);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user email and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        field: user.field,
        department: user.department,
        customDepartment: user.customDepartment,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      
      // If password is provided, require currentPassword and check it
      if (req.body.password) {
        if (!req.body.currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to change your password.'
          });
        }
        // Make sure password is selected for comparison
        const userWithPassword = await User.findById(req.user._id).select('+password');
        const isMatch = await userWithPassword.comparePassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect.'
          });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}).skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (own profile) / Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (own profile) / Admin
const updateUser = async (req, res) => {
  try {
    const { fullName, email, role, field, password } = req.body;
    
    // Find the user first
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validate field requirement for students
    if (role === 'student' && !field) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field is required for students' 
      });
    }

    // Update user fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role) user.role = role;
    
    // Handle field based on role
    if (role === 'student' && field) {
      user.field = field;
    } else if (role === 'admin') {
      user.field = undefined; // Remove field for admin users
    }

    // Handle password update
    if (password) {
      user.password = password; // Will be hashed by pre-save middleware
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        field: updatedUser.field,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create user by admin
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, field, department, customDepartment } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate field requirement for students
    if (role === 'student' && !field) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field is required for students' 
      });
    }

    // Validate department requirement for ASYV Items users
    if (role === 'asyv-items' && !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department is required for ASYV Items users' 
      });
    }

    // Validate custom department requirement
    if (role === 'asyv-items' && department === 'custom' && !customDepartment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Custom department name is required when selecting custom department' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user data
    const userData = {
      fullName,
      email,
      password,
      role: role || 'student'
    };

    // Add field only for students
    if (role === 'student' && field) {
      userData.field = field;
    }

    // Add department for ASYV Items users
    if (role === 'asyv-items') {
      userData.department = department;
      if (department === 'custom' && customDepartment) {
        userData.customDepartment = customDepartment;
      }
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        field: user.field,
        department: user.department,
        customDepartment: user.customDepartment,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser
};
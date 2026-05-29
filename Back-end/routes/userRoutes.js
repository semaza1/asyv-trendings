// routes/userRoutes.js - Updated with authentication
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  createUser
} = require('../controllers/userController');
const { protect, admin, ownerOrAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin only routes
router.get('/', protect, admin, getUsers);
router.post('/', protect, admin, createUser); // Admin can create users

// Owner or admin routes
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser); // Only admin can delete users

module.exports = router;
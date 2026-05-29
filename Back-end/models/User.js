// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'asyv-items'],
    default: 'student'
  },
  field: {
    type: String,
    enum: ['news', 'opportunities', 'events', 'sports', 'visitors', 'did-you-know', 'projects'],
    required: function() {
      return this.role === 'student';
    }
  },
  department: {
    type: String,
    enum: ['IT', 'L&P', 'HLD', 'PW', 'School', 'LEAP', 'ILC', 'HR', 'FINANCE', 'ADMINISTRATION', 'All Departments', 'custom'],
    required: function() {
      return this.role === 'asyv-items';
    }
  },
  customDepartment: {
    type: String,
    required: function() {
      return this.role === 'asyv-items' && this.department === 'custom';
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
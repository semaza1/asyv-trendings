const mongoose = require('mongoose');

const itItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Item type is required'],
    trim: true,
    lowercase: true,
    maxlength: [50, 'Item type cannot exceed 50 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  purchasedDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Purchase date cannot be in the future'
    }
  },
  serialNumber: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [100, 'Serial number cannot exceed 100 characters']
  },
  macAddress: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(mac) {
        if (!mac) return true; // MAC address is optional
        // Validate MAC address format (XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)
        const macRegex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;
        return macRegex.test(mac);
      },
      message: 'Invalid MAC address format. Use XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['working', 'under maintenance', 'need attention', 'not active'],
      message: 'Please select a valid status'
    },
    default: 'working'
  },
  operationStatus: {
    type: String,
    enum: {
      values: ['working well', 'slow', 'critical'],
      message: 'Please select a valid operation status'
    },
    default: 'working well'
  },
  assignmentType: {
    type: String,
    enum: {
      values: ['staff', 'location'],
      message: 'Assignment type must be either staff or location'
    },
    default: 'location'
  },
  location: {
    type: String,
    required: [true, 'Location/Owner is required'],
    trim: true,
    maxlength: [200, 'Location/Owner cannot exceed 200 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
itItemSchema.index({ type: 1 });
itItemSchema.index({ status: 1 });
itItemSchema.index({ location: 1 });
itItemSchema.index({ createdAt: -1 });
itItemSchema.index({ itemName: 'text', location: 'text', department: 'text', model: 'text' }); // Text search

// Virtual for getting the display type
itItemSchema.virtual('displayType').get(function() {
  return this.type;
});

// Virtual for warranty status
itItemSchema.virtual('warrantyStatus').get(function() {
  if (!this.warrantyExpiry) return 'unknown';
  const now = new Date();
  const expiry = new Date(this.warrantyExpiry);
  
  if (expiry < now) return 'expired';
  
  // Check if warranty expires within 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  if (expiry <= thirtyDaysFromNow) return 'expiring_soon';
  
  return 'active';
});

// Pre-save middleware to handle MAC address formatting
itItemSchema.pre('save', function(next) {
  if (this.macAddress) {
    // Convert to uppercase and ensure consistent format with colons
    this.macAddress = this.macAddress.replace(/[-]/g, ':').toUpperCase();
  }
  next();
});

// Static method to get items by status
itItemSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ itemName: 1 });
};

// Static method to search items
itItemSchema.statics.searchItems = function(searchTerm) {
  return this.find({
    $or: [
      { itemName: { $regex: searchTerm, $options: 'i' } },
      { type: { $regex: searchTerm, $options: 'i' } },
      { model: { $regex: searchTerm, $options: 'i' } },
      { location: { $regex: searchTerm, $options: 'i' } },
      { serialNumber: { $regex: searchTerm, $options: 'i' } },
      { macAddress: { $regex: searchTerm, $options: 'i' } },
      { department: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ status: 1, itemName: 1 });
};

// Instance method to update status
itItemSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  return this.save();
};

module.exports = mongoose.model('ITItem', itItemSchema);

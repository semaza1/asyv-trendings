const mongoose = require('mongoose');

const deviceActionSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ITItem',
    required: [true, 'Item ID is required'],
    index: true
  },
  actionType: {
    type: String,
    required: [true, 'Action type is required'],
    trim: true,
    lowercase: true,
    maxlength: [100, 'Action type cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  fromLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'From location cannot exceed 200 characters']
  },
  toLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'To location cannot exceed 200 characters']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performed by is required']
  },
  performedByName: {
    type: String,
    required: true,
    trim: true
  },
  actionDate: {
    type: Date,
    required: [true, 'Action date is required'],
    default: Date.now,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Action date cannot be in the future'
    }
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled'],
      message: 'Please select a valid status'
    },
    default: 'completed'
  },
  operationStatus: {
    type: String,
    enum: {
      values: ['working well', 'slow', 'critical'],
      message: 'Please select a valid operation status'
    },
    default: 'working well'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient queries
deviceActionSchema.index({ itemId: 1, actionDate: -1 });
deviceActionSchema.index({ actionType: 1 });
deviceActionSchema.index({ performedBy: 1 });
deviceActionSchema.index({ actionDate: -1 });

// Virtual to get the related IT item
deviceActionSchema.virtual('item', {
  ref: 'ITItem',
  localField: 'itemId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to update device location if action is relocation
deviceActionSchema.pre('save', async function(next) {
  if (this.isNew && this.actionType === 'relocation' && this.toLocation) {
    try {
      const ITItem = mongoose.model('ITItem');
      await ITItem.findByIdAndUpdate(this.itemId, {
        location: this.toLocation,
        updatedBy: this.performedBy
      });
    } catch (error) {
      console.error('Error updating device location:', error);
    }
  }
  next();
});

// Static method to get actions for a specific device
deviceActionSchema.statics.getDeviceActions = function(itemId, options = {}) {
  const query = this.find({ itemId });
  
  // Apply filters if provided
  if (options.actionType) {
    query.where('actionType').equals(options.actionType);
  }
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.startDate || options.endDate) {
    const dateFilter = {};
    if (options.startDate) dateFilter.$gte = new Date(options.startDate);
    if (options.endDate) dateFilter.$lte = new Date(options.endDate);
    query.where('actionDate').gte(dateFilter.$gte).lte(dateFilter.$lte);
  }
  
  // Populate user information
  query.populate('performedBy', 'fullName email');
  
  // Sort by date (newest first)
  query.sort({ actionDate: -1 });
  
  // Apply pagination if provided
  if (options.limit) {
    query.limit(parseInt(options.limit));
  }
  
  if (options.skip) {
    query.skip(parseInt(options.skip));
  }
  
  return query;
};

// Static method to get action statistics for a device
deviceActionSchema.statics.getDeviceStats = async function(itemId) {
  const stats = await this.aggregate([
    { $match: { itemId: mongoose.Types.ObjectId(itemId) } },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' }
      }
    }
  ]);
  
  const totalActions = await this.countDocuments({ itemId });
  const totalCost = await this.aggregate([
    { $match: { itemId: mongoose.Types.ObjectId(itemId) } },
    { $group: { _id: null, total: { $sum: '$cost' } } }
  ]);
  
  return {
    totalActions,
    totalCost: totalCost.length > 0 ? totalCost[0].total : 0,
    byType: stats
  };
};

// Static method to search actions
deviceActionSchema.statics.searchActions = function(itemId, searchTerm) {
  return this.find({
    itemId,
    $or: [
      { description: { $regex: searchTerm, $options: 'i' } },
      { actionType: { $regex: searchTerm, $options: 'i' } },
      { notes: { $regex: searchTerm, $options: 'i' } },
      { performedByName: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ actionDate: -1 });
};

// Instance method to mark action as completed
deviceActionSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Instance method to cancel action
deviceActionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

module.exports = mongoose.model('DeviceAction', deviceActionSchema);

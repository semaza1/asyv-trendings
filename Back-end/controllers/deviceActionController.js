const DeviceAction = require('../models/DeviceAction');
const ITItem = require('../models/ITItem');

// @desc    Get all actions for a specific device
// @route   GET /api/device-actions/:itemId
// @access  Private
exports.getDeviceActions = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { actionType, status, startDate, endDate, limit, skip } = req.query;

    // Verify the device exists
    const device = await ITItem.findById(itemId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Department validation for ASYV Items users
    if (req.user && req.user.role === 'asyv-items') {
      if (req.user.department && req.user.department !== 'All Departments') {
        const userDepartment = req.user.department === 'custom' ? req.user.customDepartment : req.user.department;
        if (device.department !== userDepartment) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You can only view actions for items from the ${userDepartment} department.`
          });
        }
      }
    }

    // Build filter options
    const options = {};
    if (actionType) options.actionType = actionType;
    if (status) options.status = status;
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (limit) options.limit = limit;
    if (skip) options.skip = skip;

    const actions = await DeviceAction.getDeviceActions(itemId, options);

    res.status(200).json({
      success: true,
      count: actions.length,
      data: actions
    });
  } catch (error) {
    console.error('Error fetching device actions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device actions',
      error: error.message
    });
  }
};

// @desc    Get action statistics for a device
// @route   GET /api/device-actions/:itemId/stats
// @access  Private
exports.getDeviceStats = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Verify the device exists
    const device = await ITItem.findById(itemId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Department validation for ASYV Items users
    if (req.user && req.user.role === 'asyv-items') {
      if (req.user.department && req.user.department !== 'All Departments') {
        const userDepartment = req.user.department === 'custom' ? req.user.customDepartment : req.user.department;
        if (device.department !== userDepartment) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You can only view stats for items from the ${userDepartment} department.`
          });
        }
      }
    }

    const stats = await DeviceAction.getDeviceStats(itemId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching device stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device statistics',
      error: error.message
    });
  }
};

// @desc    Search actions for a device
// @route   GET /api/device-actions/:itemId/search
// @access  Private
exports.searchDeviceActions = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const actions = await DeviceAction.searchActions(itemId, q);

    res.status(200).json({
      success: true,
      count: actions.length,
      data: actions
    });
  } catch (error) {
    console.error('Error searching device actions:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching device actions',
      error: error.message
    });
  }
};

// @desc    Create a new action for a device
// @route   POST /api/device-actions
// @access  Private
exports.createAction = async (req, res) => {
  try {
    const {
      itemId,
      actionType,
      description,
      fromLocation,
      toLocation,
      actionDate,
      cost,
      notes,
      status,
      operationStatus
    } = req.body;

    // Verify the device exists
    const device = await ITItem.findById(itemId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Create the action
    const action = await DeviceAction.create({
      itemId,
      actionType: actionType.toLowerCase().trim(),
      description: description.trim(),
      fromLocation: fromLocation?.trim(),
      toLocation: toLocation?.trim(),
      performedBy: req.user._id,
      performedByName: req.user.fullName || req.user.email,
      actionDate: actionDate || Date.now(),
      cost: cost || 0,
      notes: notes?.trim(),
      status: status || 'completed',
      operationStatus: operationStatus || 'working well'
    });

    // Populate user information
    await action.populate('performedBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Action created successfully',
      data: action
    });
  } catch (error) {
    console.error('Error creating action:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating action',
      error: error.message
    });
  }
};

// @desc    Update an action
// @route   PUT /api/device-actions/:actionId
// @access  Private
exports.updateAction = async (req, res) => {
  try {
    const { actionId } = req.params;
    const updateData = { ...req.body };

    // Find the action
    let action = await DeviceAction.findById(actionId);
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    // Normalize actionType if provided
    if (updateData.actionType) {
      updateData.actionType = updateData.actionType.toLowerCase().trim();
    }

    // Update the action
    action = await DeviceAction.findByIdAndUpdate(
      actionId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('performedBy', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Action updated successfully',
      data: action
    });
  } catch (error) {
    console.error('Error updating action:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating action',
      error: error.message
    });
  }
};

// @desc    Delete an action
// @route   DELETE /api/device-actions/:actionId
// @access  Private
exports.deleteAction = async (req, res) => {
  try {
    const { actionId } = req.params;

    const action = await DeviceAction.findById(actionId);
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    await action.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Action deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting action:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting action',
      error: error.message
    });
  }
};

// @desc    Get a single action by ID
// @route   GET /api/device-actions/action/:actionId
// @access  Private
exports.getActionById = async (req, res) => {
  try {
    const { actionId } = req.params;

    const action = await DeviceAction.findById(actionId)
      .populate('performedBy', 'fullName email')
      .populate('itemId', 'itemName type location');

    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    res.status(200).json({
      success: true,
      data: action
    });
  } catch (error) {
    console.error('Error fetching action:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching action',
      error: error.message
    });
  }
};

// @desc    Mark action as completed
// @route   PATCH /api/device-actions/:actionId/complete
// @access  Private
exports.markAsCompleted = async (req, res) => {
  try {
    const { actionId } = req.params;

    const action = await DeviceAction.findById(actionId);
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    await action.markAsCompleted();

    res.status(200).json({
      success: true,
      message: 'Action marked as completed',
      data: action
    });
  } catch (error) {
    console.error('Error marking action as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking action as completed',
      error: error.message
    });
  }
};

// @desc    Cancel an action
// @route   PATCH /api/device-actions/:actionId/cancel
// @access  Private
exports.cancelAction = async (req, res) => {
  try {
    const { actionId } = req.params;

    const action = await DeviceAction.findById(actionId);
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action not found'
      });
    }

    await action.cancel();

    res.status(200).json({
      success: true,
      message: 'Action cancelled',
      data: action
    });
  } catch (error) {
    console.error('Error cancelling action:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling action',
      error: error.message
    });
  }
};

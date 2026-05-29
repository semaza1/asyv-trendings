const ITItem = require('../models/ITItem');
const mongoose = require('mongoose');

// @desc    Get all IT items
// @route   GET /api/it-items
// @access  Private/Admin
const getITItems = async (req, res) => {
  try {
    console.log('GET /api/it-items called');
    console.log('User:', req.user ? req.user.fullName : 'No user');
    
    const {
      status,
      type,
      department,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Department filtering for ASYV Items users
    if (department) {
      filter.department = department;
    }

    // Additional role-based filtering
    if (req.user && req.user.role === 'asyv-items') {
      // If user has a specific department, only show items from that department
      if (req.user.department && req.user.department !== 'All Departments') {
        const userDepartment = req.user.department === 'custom' ? req.user.customDepartment : req.user.department;
        filter.department = userDepartment;
      }
    }

    // Build search query
    let query;

    if (search) {
      // Use search with additional filters
      const searchFilter = {
        $and: [
          {
            $or: [
              { itemName: { $regex: search, $options: 'i' } },
              { type: { $regex: search, $options: 'i' } },
              { customType: { $regex: search, $options: 'i' } },
              { model: { $regex: search, $options: 'i' } },
              { location: { $regex: search, $options: 'i' } },
              { macAddress: { $regex: search, $options: 'i' } },
              { department: { $regex: search, $options: 'i' } }
            ]
          },
          filter
        ]
      };
      query = ITItem.find(Object.keys(filter).length > 0 ? searchFilter : searchFilter.$and[0]);
    } else {
      query = ITItem.find(filter);
    }

    // Apply sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);

    // Apply pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));

    // Populate user references
    query = query.populate('createdBy', 'fullName email')
                 .populate('updatedBy', 'fullName email');

    const items = await query;
    const total = await ITItem.countDocuments(filter);

    // Get status counts for dashboard
    const statusCounts = await ITItem.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
      total,
      working: statusCounts.find(s => s._id === 'working')?.count || 0,
      'not working': statusCounts.find(s => s._id === 'not working')?.count || 0,
      'under maintenance': statusCounts.find(s => s._id === 'under maintenance')?.count || 0
    };

    console.log('Returning items:', items.length);
    console.log('Stats:', stats);

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single IT item
// @route   GET /api/it-items/:id
// @access  Private/Admin
const getITItem = async (req, res) => {
  try {
    const item = await ITItem.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new IT item
// @route   POST /api/it-items
// @access  Private/Admin
const createITItem = async (req, res) => {
  try {
    const {
      itemName,
      type,
      customType,
      model,
      purchasedDate,
      macAddress,
      status,
      operationStatus,
      assignmentType,
      location,
      department,
      notes,
      serialNumber,
      warrantyExpiry
    } = req.body;

    // Validate required fields
    if (!itemName || !type || !purchasedDate || !location || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: itemName, type, purchasedDate, location, department'
      });
    }

    // Validate custom type if type is 'other'
    if (type === 'other' && !customType) {
      return res.status(400).json({
        success: false,
        message: 'Custom type is required when type is "other"'
      });
    }

    // Department validation for ASYV Items users
    if (req.user && req.user.role === 'asyv-items') {
      if (req.user.department && req.user.department !== 'All Departments') {
        const userDepartment = req.user.department === 'custom' ? req.user.customDepartment : req.user.department;
        if (department !== userDepartment) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You can only create items for the ${userDepartment} department.`
          });
        }
      }
    }

    // Check for duplicate MAC address if provided
    if (macAddress) {
      const existingItem = await ITItem.findOne({ 
        macAddress: macAddress.toUpperCase().replace(/[-]/g, ':')
      });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'An item with this MAC address already exists'
        });
      }
    }

    const itemData = {
      itemName,
      type: type.toLowerCase(),
      purchasedDate,
      status: status || 'working',
      assignmentType: assignmentType || 'location',
      location,
      department,
      createdBy: req.user.id
    };

    // Add optional fields if provided
    if (customType && type === 'other') itemData.customType = customType;
    if (model) itemData.model = model;
    if (operationStatus) itemData.operationStatus = operationStatus;
    if (macAddress) itemData.macAddress = macAddress;
    if (notes) itemData.notes = notes;
    if (serialNumber) itemData.serialNumber = serialNumber;
    if (warrantyExpiry) itemData.warrantyExpiry = warrantyExpiry;

    const item = await ITItem.create(itemData);

    // Populate user reference before sending response
    await item.populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'IT item created successfully',
      data: item
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update IT item
// @route   PUT /api/it-items/:id
// @access  Private/Admin
const updateITItem = async (req, res) => {
  try {
    const {
      itemName,
      type,
      customType,
      model,
      purchasedDate,
      macAddress,
      status,
      operationStatus,
      assignmentType,
      location,
      department,
      notes,
      serialNumber,
      warrantyExpiry
    } = req.body;

    const item = await ITItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }

    // Department validation for ASYV Items users
    if (req.user && req.user.role === 'asyv-items') {
      if (req.user.department && req.user.department !== 'All Departments') {
        const userDepartment = req.user.department === 'custom' ? req.user.customDepartment : req.user.department;
        // Check if user can access the existing item
        if (item.department !== userDepartment) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You can only edit items from the ${userDepartment} department.`
          });
        }
        // Check if user is trying to change department to something they don't have access to
        if (department && department !== userDepartment) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You can only assign items to the ${userDepartment} department.`
          });
        }
      }
    }

    // Check for duplicate MAC address if MAC is being updated
    if (macAddress && macAddress !== item.macAddress) {
      const existingItem = await ITItem.findOne({ 
        macAddress: macAddress.toUpperCase().replace(/[-]/g, ':'),
        _id: { $ne: req.params.id }
      });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'An item with this MAC address already exists'
        });
      }
    }

    // Update fields
    if (itemName) item.itemName = itemName;
    if (type) {
      item.type = type.toLowerCase();
      // Clear customType if type is not 'other'
      if (type !== 'other') {
        item.customType = undefined;
      }
    }
    if (customType && item.type === 'other') item.customType = customType;
    if (model !== undefined) item.model = model; // Allow clearing model
    if (purchasedDate) item.purchasedDate = purchasedDate;
    if (macAddress !== undefined) item.macAddress = macAddress; // Allow clearing MAC address
    if (status) item.status = status;
    if (operationStatus) item.operationStatus = operationStatus;
    if (assignmentType) item.assignmentType = assignmentType;
    if (location) item.location = location;
    if (department) item.department = department;
    if (notes !== undefined) item.notes = notes; // Allow clearing notes
    if (serialNumber !== undefined) item.serialNumber = serialNumber;
    if (warrantyExpiry !== undefined) item.warrantyExpiry = warrantyExpiry;
    
    item.updatedBy = req.user.id;

    const updatedItem = await item.save();

    // Populate user references
    await updatedItem.populate('createdBy', 'fullName email');
    await updatedItem.populate('updatedBy', 'fullName email');

    res.json({
      success: true,
      message: 'IT item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete IT item
// @route   DELETE /api/it-items/:id
// @access  Private/Admin
const deleteITItem = async (req, res) => {
  try {
    const item = await ITItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }

    // Department validation for ASYV Items users
    if (req.user && req.user.role === 'asyv-items') {
      if (req.user.department && req.user.department !== 'All Departments') {
        const userDepartment = req.user.department === 'custom' ? req.user.customDepartment : req.user.department;
        if (item.department !== userDepartment) {
          return res.status(403).json({
            success: false,
            message: `Access denied. You can only delete items from the ${userDepartment} department.`
          });
        }
      }
    }

    await ITItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'IT item deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update IT item status
// @route   PATCH /api/it-items/:id/status
// @access  Private/Admin
const updateITItemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['working', 'not working', 'under maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: working, not working, or under maintenance'
      });
    }

    const item = await ITItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }

    const updatedItem = await item.updateStatus(status, req.user.id);
    await updatedItem.populate('updatedBy', 'fullName email');

    res.json({
      success: true,
      message: 'IT item status updated successfully',
      data: updatedItem
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'IT item not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get IT items dashboard stats
// @route   GET /api/it-items/stats
// @access  Private/Admin
const getITItemStats = async (req, res) => {
  try {
    // Get status counts
    const statusCounts = await ITItem.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get type counts
    const typeCounts = await ITItem.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get recent items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentItems = await ITItem.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).countDocuments();

    // Get warranty expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const warrantyExpiringSoon = await ITItem.find({
      warrantyExpiry: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    }).countDocuments();

    const stats = {
      total: await ITItem.countDocuments(),
      working: statusCounts.find(s => s._id === 'working')?.count || 0,
      'not working': statusCounts.find(s => s._id === 'not working')?.count || 0,
      'under maintenance': statusCounts.find(s => s._id === 'under maintenance')?.count || 0,
      recentItems,
      warrantyExpiringSoon,
      typeBreakdown: typeCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all unique types used in the system
// @route   GET /api/it-items/types
// @access  Private/Admin
const getITItemTypes = async (req, res) => {
  try {
    console.log('GET /api/it-items/types called');
    
    // Get all unique types from the database
    const uniqueTypes = await ITItem.distinct('type');
    
    // Predefined standard types
    const standardTypes = [
      'laptop',
      'desktop', 
      'printer',
      'monitor',
      'photocopy machine',
      'projector',
      'tablet',
      'network equipment'
    ];
    
    // Get custom types (types not in standard list)
    const customTypes = uniqueTypes.filter(type => 
      type && !standardTypes.includes(type.toLowerCase())
    );
    
    console.log('Standard types:', standardTypes.length);
    console.log('Custom types found:', customTypes);
    
    res.json({
      success: true,
      data: {
        standardTypes,
        customTypes: customTypes.map(type => ({
          value: type.toLowerCase(),
          label: type.charAt(0).toUpperCase() + type.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2'),
          isCustom: true
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching IT item types:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// BULK IT Item creation (from Excel/CSV import)
const createITItemsBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided.' });
    }
    const results = {
      successes: [],
      errors: []
    };
    // Used MACs tracker to avoid duplicates both in DB and in the current batch
    const usedMacs = new Set();
    // Get all MAC addresses already in DB, for fast duplicate checking
    const allMacsInDBArr = await ITItem.find({ macAddress: { $exists: true, $ne: null, $ne: '' } }, 'macAddress').lean();
    const allMacsInDB = new Set(allMacsInDBArr.map(x => x.macAddress));
    // Process each item
    for (let i = 0; i < items.length; i++) {
      const data = items[i];
      const {
        itemName,
        type,
        customType,
        purchasedDate,
        macAddress,
        status,
        assignmentType,
        location,
        department,
        notes,
        serialNumber,
        warrantyExpiry
      } = data;
      // Validation
      if (!itemName || !type || !purchasedDate || !location || !department) {
        results.errors.push({ row: i + 1, error: 'Missing required fields: itemName, type, purchasedDate, location, or department.' });
        continue;
      }
      // MAC check
      let mac = (macAddress || '').toUpperCase().replace(/[-]/g, ':').trim();
      if (mac) {
        if (allMacsInDB.has(mac) || usedMacs.has(mac)) {
          results.errors.push({ row: i + 1, error: 'Duplicate MAC address: ' + mac });
          continue;
        }
        // Validate MAC format
        const macRegex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;
        if (!macRegex.test(mac)) {
          results.errors.push({ row: i + 1, error: 'Invalid MAC address format for: ' + mac });
          continue;
        }
        usedMacs.add(mac);
      }
      // Date validation
      const purchaseD = new Date(purchasedDate);
      if (isNaN(purchaseD.getTime()) || purchaseD > new Date()) {
        results.errors.push({ row: i + 1, error: 'Invalid or future purchase date.' });
        continue;
      }
      // Prep item data
      let itemData = {
        itemName,
        type: (type || '').toLowerCase(),
        purchasedDate: purchaseD,
        status: status || 'working',
        assignmentType: assignmentType || 'location',
        location,
        department,
        createdBy: req.user.id
      };
      if (mac) itemData.macAddress = mac;
      if (customType && (type === 'other' || type === 'custom')) itemData.customType = customType;
      if (notes) itemData.notes = notes;
      if (serialNumber) itemData.serialNumber = serialNumber;
      if (warrantyExpiry) itemData.warrantyExpiry = warrantyExpiry;
      try {
        const created = await ITItem.create(itemData);
        results.successes.push(created);
      } catch (err) {
        let errMsg = err.message;
        if (err.name === 'ValidationError') {
          errMsg = Object.values(err.errors).map(e => e.message).join('. ');
        }
        results.errors.push({ row: i + 1, error: errMsg });
      }
    }
    return res.json({ success: true, data: results.successes, errors: results.errors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getITItems,
  getITItem,
  createITItem,
  updateITItem,
  deleteITItem,
  updateITItemStatus,
  getITItemStats,
  getITItemTypes,
  createITItemsBulk
};

const express = require('express');
const router = express.Router();
const {
  getITItems,
  getITItem,
  createITItem,
  updateITItem,
  deleteITItem,
  updateITItemStatus,
  getITItemStats,
  getITItemTypes,
  createITItemsBulk
} = require('../controllers/itItemController');
const { protect, itAdminOrAdmin } = require('../middleware/auth');

// All routes require authentication and admin or it-admin privileges
router.use(protect);
router.use(itAdminOrAdmin);

// @route   GET /api/it-items/stats
// @desc    Get IT items dashboard statistics
// @access  Private/Admin
router.get('/stats', getITItemStats);

// @route   GET /api/it-items/types
// @desc    Get all unique IT item types (standard + custom)
// @access  Private/Admin
router.get('/types', getITItemTypes);

// @route   GET /api/it-items
// @desc    Get all IT items with filtering, searching, and pagination
// @access  Private/Admin
router.get('/', getITItems);

// @route   POST /api/it-items
// @desc    Create new IT item
// @access  Private/Admin
router.post('/', createITItem);

// Bulk import route for IT Items (Excel/CSV import)
router.post('/bulk', createITItemsBulk);

// @route   GET /api/it-items/:id
// @desc    Get single IT item by ID
// @access  Private/Admin
router.get('/:id', getITItem);

// @route   PUT /api/it-items/:id
// @desc    Update IT item
// @access  Private/Admin
router.put('/:id', updateITItem);

// @route   DELETE /api/it-items/:id
// @desc    Delete IT item
// @access  Private/Admin
router.delete('/:id', deleteITItem);

// @route   PATCH /api/it-items/:id/status
// @desc    Update IT item status only
// @access  Private/Admin
router.patch('/:id/status', updateITItemStatus);

module.exports = router;

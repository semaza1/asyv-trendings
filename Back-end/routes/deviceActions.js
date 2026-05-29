const express = require('express');
const router = express.Router();
const {
  getDeviceActions,
  getDeviceStats,
  searchDeviceActions,
  createAction,
  updateAction,
  deleteAction,
  getActionById,
  markAsCompleted,
  cancelAction
} = require('../controllers/deviceActionController');
const { protect, itAdminOrAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Routes for device actions
router.route('/')
  .post(itAdminOrAdmin, createAction);

router.route('/:itemId')
  .get(getDeviceActions);

router.route('/:itemId/stats')
  .get(getDeviceStats);

router.route('/:itemId/search')
  .get(searchDeviceActions);

router.route('/action/:actionId')
  .get(getActionById)
  .put(itAdminOrAdmin, updateAction)
  .delete(itAdminOrAdmin, deleteAction);

router.route('/:actionId/complete')
  .patch(itAdminOrAdmin, markAsCompleted);

router.route('/:actionId/cancel')
  .patch(itAdminOrAdmin, cancelAction);

module.exports = router;

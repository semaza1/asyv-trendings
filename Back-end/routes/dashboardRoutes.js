const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

// GET /api/dashboard/recent-activity
router.get('/recent-activity', getRecentActivity);

module.exports = router; 
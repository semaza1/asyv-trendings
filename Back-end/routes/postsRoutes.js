const express = require('express');
const router = express.Router();
const { getAllPosts } = require('../controllers/postsController');

// GET /api/posts
router.get('/', getAllPosts);

module.exports = router; 
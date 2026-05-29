// routes/trendingNewsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTrendingNews,
  getTrendingNewsById,
  createTrendingNews,
  updateTrendingNews,
  deleteTrendingNews
} = require('../controllers/trendingNewsController');

router.get('/', getTrendingNews);
router.get('/:id', getTrendingNewsById);
router.post('/', createTrendingNews);
router.put('/:id', updateTrendingNews);
router.delete('/:id', deleteTrendingNews);

module.exports = router;
// controllers/trendingNewsController.js
const TrendingNews = require('../models/TrendingNews');

// @desc    Get all trending news
// @route   GET /api/trending-news
// @access  Public
const getTrendingNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags, includeFuture } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    // Exclude future posts by default for public access
    if (!includeFuture || includeFuture === 'false') {
      query.publishedDate = { $lte: new Date() };
    }

    const news = await TrendingNews.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TrendingNews.countDocuments(query);

    res.json({
      success: true,
      count: news.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get trending news by ID
// @route   GET /api/trending-news/:id
// @access  Public
const getTrendingNewsById = async (req, res) => {
  try {
    const news = await TrendingNews.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Only allow access if publishedDate is in the past or includeFuture=true
    const { includeFuture } = req.query;
    if ((!includeFuture || includeFuture === 'false') && news.publishedDate && new Date(news.publishedDate) > new Date()) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create trending news
// @route   POST /api/trending-news
// @access  Private
const createTrendingNews = async (req, res) => {
  try {
    const news = await TrendingNews.create(req.body);

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update trending news
// @route   PUT /api/trending-news/:id
// @access  Private
const updateTrendingNews = async (req, res) => {
  try {
    const news = await TrendingNews.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete trending news
// @route   DELETE /api/trending-news/:id
// @access  Private
const deleteTrendingNews = async (req, res) => {
  try {
    const news = await TrendingNews.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
  getTrendingNews,
  getTrendingNewsById,
  createTrendingNews,
  updateTrendingNews,
  deleteTrendingNews
};
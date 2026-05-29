const TrendingNews = require('../models/TrendingNews');
const Opportunities = require('../models/Opportunities');
const Events = require('../models/Events');
const Sports = require('../models/Sports');
const Projects = require('../models/Projects');
const DidYouKnow = require('../models/DidYouKnow');

// GET /api/posts
const getAllPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const includeFuture = req.query.includeFuture === 'true';
    const timeFilter = includeFuture ? {} : { publishedDate: { $lte: new Date() } };
    // Fetch from all collections in parallel
    const [news, opportunities, events, sports, projects, didYouKnow] = await Promise.all([
      TrendingNews.find(timeFilter, '_id image title description tags publishedDate').sort({ publishedDate: -1 }),
      Opportunities.find(timeFilter, '_id image title description tags publishedDate').sort({ publishedDate: -1 }),
      Events.find(timeFilter, '_id image title description tags publishedDate').sort({ publishedDate: -1 }),
      Sports.find(timeFilter, '_id image title description tags publishedDate').sort({ publishedDate: -1 }),
      Projects.find(timeFilter, '_id image title description tags publishedDate').sort({ publishedDate: -1 }),
      DidYouKnow.find(timeFilter, '_id image title description tags publishedDate').sort({ publishedDate: -1 }),
    ]);

    // Map to unified shape
    const allPosts = [
      ...news.map(post => ({ ...post.toObject(), type: 'News' })),
      ...opportunities.map(post => ({ ...post.toObject(), type: 'Opportunity' })),
      ...events.map(post => ({ ...post.toObject(), type: 'Event' })),
      ...sports.map(post => ({ ...post.toObject(), type: 'Sports' })),
      ...projects.map(post => ({ ...post.toObject(), type: 'Project' })),
      ...didYouKnow.map(post => ({ ...post.toObject(), type: 'DidYouKnow' })),
    ];
    // Sort by publishedDate descending
    allPosts.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    // Limit
    const limitedPosts = allPosts.slice(0, limit);
    res.json({ success: true, count: limitedPosts.length, data: limitedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllPosts }; 
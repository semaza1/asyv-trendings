const TrendingNews = require('../models/TrendingNews');
const Opportunities = require('../models/Opportunities');
const Events = require('../models/Events');
const Sports = require('../models/Sports');
const Projects = require('../models/Projects');
const DidYouKnow = require('../models/DidYouKnow');
const Visitors = require('../models/Visitors');
const User = require('../models/User');

// Get dashboard stats (counts for each collection)
const getDashboardStats = async (req, res) => {
  try {
    const [news, opportunities, events, sports, projects, didYouKnow, visitors, users] = await Promise.all([
      TrendingNews.countDocuments(),
      Opportunities.countDocuments(),
      Events.countDocuments(),
      Sports.countDocuments(),
      Projects.countDocuments(),
      DidYouKnow.countDocuments(),
      Visitors.countDocuments(),
      User.countDocuments(),
    ]);
    res.json({
      success: true,
      data: {
        news,
        opportunities,
        events,
        sports,
        projects,
        didYouKnow,
        visitors,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent activity (latest 2 from each collection, sorted by date)
const getRecentActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [news, opportunities, events, sports, projects, didYouKnow] = await Promise.all([
      TrendingNews.find().sort({ publishedDate: -1 }).limit(20),
      Opportunities.find().sort({ publishedDate: -1 }).limit(20),
      Events.find().sort({ publishedDate: -1 }).limit(20),
      Sports.find().sort({ publishedDate: -1 }).limit(20),
      Projects.find().sort({ publishedDate: -1 }).limit(20),
      DidYouKnow.find().sort({ publishedDate: -1 }).limit(20),
    ]);
    // Flatten and annotate
    const activity = [
      ...news.map(item => ({ type: 'News', action: item.title || 'News item', date: item.publishedDate, item })),
      ...opportunities.map(item => ({ type: 'Opportunity', action: item.title || 'Opportunity', date: item.publishedDate, item })),
      ...events.map(item => ({ type: 'Event', action: item.title || 'Event', date: item.publishedDate, item })),
      ...sports.map(item => ({ type: 'Sports', action: item.title || 'Sports', date: item.publishedDate, item })),
      ...projects.map(item => ({ type: 'Project', action: item.title || 'Project', date: item.publishedDate, item })),
      ...didYouKnow.map(item => ({ type: 'DidYouKnow', action: item.title || 'Did You Know', date: item.publishedDate, item })),
    ];
    // Sort by date descending
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = activity.length;
    const pages = Math.ceil(total / limit);
    const paginated = activity.slice(skip, skip + limit);
    res.json({
      success: true,
      data: paginated,
      total,
      page,
      pages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
}; 
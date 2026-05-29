// controllers/sportsController.js
const Sports = require('../models/Sports');

const getSports = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags } = req.query;
    const includeFuture = req.query.includeFuture === 'true';
    const timeFilter = includeFuture ? {} : { publishedDate: { $lte: new Date() } };
    const skip = (page - 1) * limit;

    let query = {};
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    query = { ...query, ...timeFilter };

    const sports = await Sports.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Sports.countDocuments(query);

    res.json({
      success: true,
      count: sports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSportsById = async (req, res) => {
  try {
    const sport = await Sports.findById(req.params.id);
    if (!sport) {
      return res.status(404).json({ message: 'Sports item not found' });
    }
    const includeFuture = req.query.includeFuture === 'true';
    if (!includeFuture && sport.publishedDate && new Date(sport.publishedDate) > new Date()) {
      return res.status(404).json({ message: 'Sports item not found' });
    }
    res.json({ success: true, data: sport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSports = async (req, res) => {
  try {
    const sport = await Sports.create(req.body);
    res.status(201).json({ success: true, data: sport });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateSports = async (req, res) => {
  try {
    const sport = await Sports.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sport) {
      return res.status(404).json({ message: 'Sports item not found' });
    }
    res.json({ success: true, data: sport });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteSports = async (req, res) => {
  try {
    const sport = await Sports.findByIdAndDelete(req.params.id);
    if (!sport) {
      return res.status(404).json({ message: 'Sports item not found' });
    }
    res.json({ success: true, message: 'Sports item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getSports,
  getSportsById,
  createSports,
  updateSports,
  deleteSports
};
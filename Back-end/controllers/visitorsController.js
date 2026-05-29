// controllers/visitorsController.js
const Visitors = require('../models/Visitors');

const getVisitors = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags } = req.query;
    const includeFuture = req.query.includeFuture === 'true';
    const timeFilter = includeFuture ? {} : { publishedDate: { $lte: new Date() } };
    const skip = (page - 1) * limit;

    let query = {};
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    query = { ...query, ...timeFilter };

    const visitors = await Visitors.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Visitors.countDocuments(query);

    res.json({
      success: true,
      count: visitors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: visitors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitors.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    const includeFuture = req.query.includeFuture === 'true';
    if (!includeFuture && visitor.publishedDate && new Date(visitor.publishedDate) > new Date()) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json({ success: true, data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createVisitor = async (req, res) => {
  try {
    const visitor = await Visitors.create(req.body);
    res.status(201).json({ success: true, data: visitor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitors.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json({ success: true, data: visitor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitors.findByIdAndDelete(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json({ success: true, message: 'Visitor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor
};
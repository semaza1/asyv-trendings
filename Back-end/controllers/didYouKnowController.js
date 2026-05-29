// controllers/didYouKnowController.js
const DidYouKnow = require('../models/DidYouKnow');

const getDidYouKnow = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags } = req.query;
    const includeFuture = req.query.includeFuture === 'true';
    const timeFilter = includeFuture ? {} : { publishedDate: { $lte: new Date() } };
    const skip = (page - 1) * limit;

    let query = {};
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    query = { ...query, ...timeFilter };

    const didYouKnow = await DidYouKnow.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DidYouKnow.countDocuments(query);

    res.json({
      success: true,
      count: didYouKnow.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: didYouKnow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDidYouKnowById = async (req, res) => {
  try {
    const didYouKnow = await DidYouKnow.findById(req.params.id);
    if (!didYouKnow) {
      return res.status(404).json({ message: 'Did You Know item not found' });
    }
    const includeFuture = req.query.includeFuture === 'true';
    if (!includeFuture && didYouKnow.publishedDate && new Date(didYouKnow.publishedDate) > new Date()) {
      return res.status(404).json({ message: 'Did You Know item not found' });
    }
    res.json({ success: true, data: didYouKnow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDidYouKnow = async (req, res) => {
  try {
    const didYouKnow = await DidYouKnow.create(req.body);
    res.status(201).json({ success: true, data: didYouKnow });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateDidYouKnow = async (req, res) => {
  try {
    const didYouKnow = await DidYouKnow.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!didYouKnow) {
      return res.status(404).json({ message: 'Did You Know item not found' });
    }
    res.json({ success: true, data: didYouKnow });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteDidYouKnow = async (req, res) => {
  try {
    const didYouKnow = await DidYouKnow.findByIdAndDelete(req.params.id);
    if (!didYouKnow) {
      return res.status(404).json({ message: 'Did You Know item not found' });
    }
    res.json({ success: true, message: 'Did You Know item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getDidYouKnow,
  getDidYouKnowById,
  createDidYouKnow,
  updateDidYouKnow,
  deleteDidYouKnow
};
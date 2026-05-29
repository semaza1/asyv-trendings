// controllers/opportunitiesController.js
const Opportunities = require('../models/Opportunities');

const getOpportunities = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags } = req.query;
    const includeFuture = req.query.includeFuture === 'true';
    const timeFilter = includeFuture ? {} : { publishedDate: { $lte: new Date() } };
    const skip = (page - 1) * limit;

    let query = {};
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    query = { ...query, ...timeFilter };

    const opportunities = await Opportunities.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Opportunities.countDocuments(query);

    res.json({
      success: true,
      count: opportunities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: opportunities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunities.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    const includeFuture = req.query.includeFuture === 'true';
    if (!includeFuture && opportunity.publishedDate && new Date(opportunity.publishedDate) > new Date()) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunities.create(req.body);
    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunities.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json({ success: true, data: opportunity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunities.findByIdAndDelete(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
};
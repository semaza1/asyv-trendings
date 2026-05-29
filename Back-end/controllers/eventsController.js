// controllers/eventsController.js
const Events = require('../models/Events');

const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags, location } = req.query;
    const includeFuture = req.query.includeFuture === 'true';
    const timeFilter = includeFuture ? {} : { publishedDate: { $lte: new Date() } };
    const skip = (page - 1) * limit;

    let query = {};
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (location) query.location = new RegExp(location, 'i');
    query = { ...query, ...timeFilter };

    const events = await Events.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Events.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const includeFuture = req.query.includeFuture === 'true';
    if (!includeFuture && event.publishedDate && new Date(event.publishedDate) > new Date()) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await Events.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Events.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Events.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
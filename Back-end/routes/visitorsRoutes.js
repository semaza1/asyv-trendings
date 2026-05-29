// routes/visitorsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor
} = require('../controllers/visitorsController');

router.get('/', getVisitors);
router.get('/:id', getVisitorById);
router.post('/', createVisitor);
router.put('/:id', updateVisitor);
router.delete('/:id', deleteVisitor);

module.exports = router;
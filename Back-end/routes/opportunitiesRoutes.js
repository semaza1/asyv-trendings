// routes/opportunitiesRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunitiesController');

router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);
router.post('/', createOpportunity);
router.put('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);

module.exports = router;
// routes/sportsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getSports,
  getSportsById,
  createSports,
  updateSports,
  deleteSports
} = require('../controllers/sportsController');

router.get('/', getSports);
router.get('/:id', getSportsById);
router.post('/', createSports);
router.put('/:id', updateSports);
router.delete('/:id', deleteSports);

module.exports = router;
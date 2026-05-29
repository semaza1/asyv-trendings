// routes/didYouKnowRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDidYouKnow,
  getDidYouKnowById,
  createDidYouKnow,
  updateDidYouKnow,
  deleteDidYouKnow
} = require('../controllers/didYouKnowController');

router.get('/', getDidYouKnow);
router.get('/:id', getDidYouKnowById);
router.post('/', createDidYouKnow);
router.put('/:id', updateDidYouKnow);
router.delete('/:id', deleteDidYouKnow);

module.exports = router;
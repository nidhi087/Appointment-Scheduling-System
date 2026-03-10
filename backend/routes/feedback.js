const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { requireAuth } = require('../middleware/auth');

// POST /api/feedback — submit a review
router.post('/', requireAuth, async (req, res) => {
  try {
    const { appointment, provider, rating, comment } = req.body;
    if (!appointment || !provider || !rating)
      return res.status(400).json({ message: 'appointment, provider and rating are required.' });

    const existing = await Feedback.findOne({ appointment, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this appointment.' });

    const feedback = await Feedback.create({
      user: req.user._id, appointment, provider, rating, comment
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback?provider_id=X — reviews for a provider
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.provider_id) filter.provider = req.query.provider_id;
    const feedback = await Feedback.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

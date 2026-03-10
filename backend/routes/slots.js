const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/slots?provider_id=X&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.provider_id) filter.provider = req.query.provider_id;
    if (req.query.date) filter.date = req.query.date;
    const slots = await Slot.find(filter).sort({ time: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/slots (admin) — create one or many slots
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { provider, date, times } = req.body;
    if (!provider || !date || !times || !times.length)
      return res.status(400).json({ message: 'provider, date and times[] are required.' });

    const slots = await Slot.insertMany(times.map((time) => ({ provider, date, time })));
    res.status(201).json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/slots/:id (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });
    if (slot.isBooked) return res.status(400).json({ message: 'Cannot delete a booked slot.' });
    await Slot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slot deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

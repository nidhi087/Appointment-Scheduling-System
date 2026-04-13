const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Provider = require('../models/Provider');
const { requireAuth, requireAdmin, requireProvider } = require('../middleware/auth');

// GET /api/slots?provider_id=X&date=YYYY-MM-DD  (public)
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

// POST /api/slots — provider creates their own slots (or admin creates any)
router.post('/', requireAuth, requireProvider, async (req, res) => {
  try {
    const { provider, date, times } = req.body;
    if (!provider || !date || !times || !times.length)
      return res.status(400).json({ message: 'provider, date and times[] are required.' });

    // Providers can only create slots for themselves
    if (req.user.role === 'provider') {
      const myProvider = await Provider.findOne({ user: req.user._id });
      if (!myProvider || myProvider._id.toString() !== provider)
        return res.status(403).json({ message: 'You can only create slots for your own profile.' });
    }

    const slots = await Slot.insertMany(times.map((time) => ({ provider, date, time })));
    res.status(201).json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/slots/:id — provider deletes their own slot (or admin deletes any)
router.delete('/:id', requireAuth, requireProvider, async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });
    if (slot.isBooked) return res.status(400).json({ message: 'Cannot delete a booked slot.' });

    // Providers can only delete their own slots
    if (req.user.role === 'provider') {
      const myProvider = await Provider.findOne({ user: req.user._id });
      if (!myProvider || myProvider._id.toString() !== slot.provider.toString())
        return res.status(403).json({ message: 'You can only delete your own slots.' });
    }

    await Slot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slot deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

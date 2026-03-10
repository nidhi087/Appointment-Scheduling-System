const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/appointments — current user's appointments
router.get('/', requireAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('provider', 'name specialization avatarEmoji fee')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments — book an appointment
router.post('/', requireAuth, async (req, res) => {
  try {
    const { provider, slot, date, time, mode, notes } = req.body;
    if (!provider || !slot || !date || !time)
      return res.status(400).json({ message: 'provider, slot, date and time are required.' });

    // Mark slot as booked
    const slotDoc = await Slot.findById(slot);
    if (!slotDoc) return res.status(404).json({ message: 'Slot not found.' });
    if (slotDoc.isBooked) return res.status(400).json({ message: 'This slot is already booked.' });

    slotDoc.isBooked = true;
    await slotDoc.save();

    const appointment = await Appointment.create({
      user: req.user._id, provider, slot, date, time,
      mode: mode || 'In-Clinic',
      notes: notes || ''
    });

    const populated = await appointment.populate('provider', 'name specialization avatarEmoji fee');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/appointments/:id/cancel — cancel own appointment
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    if (appointment.status === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled.' });

    appointment.status = 'cancelled';
    await appointment.save();

    // Free the slot
    await Slot.findByIdAndUpdate(appointment.slot, { isBooked: false });

    res.json({ message: 'Appointment cancelled.', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ADMIN ROUTES =====

// GET /api/admin/appointments — all appointments (admin)
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const appointments = await Appointment.find(filter)
      .populate('user', 'name email')
      .populate('provider', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/appointments/:id/status (admin)
router.patch('/admin/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

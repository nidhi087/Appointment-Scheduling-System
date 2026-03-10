const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const Feedback = require('../models/Feedback');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const totalProviders = await Provider.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments();

    // Average satisfaction
    const ratings = await Feedback.find({}, 'rating');
    const satisfactionRate = ratings.length
      ? Math.round((ratings.reduce((s, f) => s + f.rating, 0) / ratings.length) * 20)
      : 98; // default until enough feedback

    res.json({ totalAppointments, totalProviders, totalCategories, satisfactionRate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

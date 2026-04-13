const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');

// Helper: generate JWT
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register  — regular user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      token: genToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register-provider  — provider self-registration
router.post('/register-provider', async (req, res) => {
  try {
    const { name, email, password, specialization, category, fee, experienceYears, bio, avatarEmoji, phone, location } = req.body;
    if (!name || !email || !password || !specialization || !category)
      return res.status(400).json({ message: 'Name, email, password, specialization and category are required.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    // Create user account with provider role
    const user = await User.create({ name, email, password, role: 'provider' });

    // Create linked provider profile
    const provider = await Provider.create({
      user: user._id,
      name,
      specialization,
      category,
      fee: fee || 500,
      experienceYears: experienceYears || 1,
      bio: bio || '',
      avatarEmoji: avatarEmoji || '👨‍💼',
      phone: phone || '',
      location: location || ''
    });

    res.status(201).json({
      token: genToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      providerId: provider._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });

    // If provider, also return their provider ID
    let providerId = null;
    if (user.role === 'provider') {
      const providerDoc = await Provider.findOne({ user: user._id }).select('_id');
      if (providerDoc) providerId = providerDoc._id;
    }

    res.json({
      token: genToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      providerId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

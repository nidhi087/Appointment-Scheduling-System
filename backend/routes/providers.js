const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const { requireAuth, requireAdmin, requireProvider } = require('../middleware/auth');

// GET /api/providers  ?category=name&search=text
router.get('/', async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) {
      const cat = await Category.findOne({ name: { $regex: req.query.category, $options: 'i' } });
      if (cat) filter.category = cat._id;
    }
    if (req.query.search) {
      const rx = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: rx }, { specialization: rx }];
    }
    const providers = await Provider.find(filter).populate('category', 'name icon color');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/providers/me  — provider's own profile
router.get('/me', requireAuth, requireProvider, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id }).populate('category', 'name icon');
    if (!provider) return res.status(404).json({ message: 'Provider profile not found.' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/providers/me  — provider edits own profile
router.put('/me', requireAuth, requireProvider, async (req, res) => {
  try {
    const allowed = ['name', 'specialization', 'category', 'fee', 'experienceYears', 'bio', 'avatarEmoji', 'phone', 'location'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true }
    ).populate('category', 'name icon');
    if (!provider) return res.status(404).json({ message: 'Provider profile not found.' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/providers/:id
router.get('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('category', 'name icon');
    if (!provider) return res.status(404).json({ message: 'Provider not found.' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/providers (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const provider = await Provider.create(req.body);
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/providers/:id (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!provider) return res.status(404).json({ message: 'Provider not found.' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/providers/:id (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Provider.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Provider deactivated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

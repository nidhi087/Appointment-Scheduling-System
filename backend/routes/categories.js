const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Provider = require('../models/Provider');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/categories — with provider count
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    const withCount = await Promise.all(categories.map(async (cat) => {
      const count = await Provider.countDocuments({ category: cat._id, isActive: true });
      return { ...cat.toObject(), providerCount: count };
    }));
    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found.' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

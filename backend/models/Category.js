const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '📋' },
  description: { type: String, default: '' },
  color: { type: String, default: 'rgba(249,115,22,0.12)' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

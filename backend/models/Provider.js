const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  specialization: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  experienceYears: { type: Number, default: 1 },
  fee: { type: Number, default: 500 },
  bio: { type: String, default: '' },
  avatarEmoji: { type: String, default: '👨‍💼' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);

const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  date: { type: String, required: true },   // stored as "YYYY-MM-DD"
  time: { type: String, required: true },   // stored as "09:00 AM"
  isBooked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);

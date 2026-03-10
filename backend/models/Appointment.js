const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  mode: { type: String, enum: ['In-Clinic', 'Online Video Call', 'Home Visit'], default: 'In-Clinic' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

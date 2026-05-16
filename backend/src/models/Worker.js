const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  craft: { type: String, required: true },
  rating: { type: Number, default: 0 },
  pricePerHour: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  experienceYears: { type: Number, default: 0 },
  availableTimes: { type: [String], default: [] }
});

module.exports = mongoose.model('Worker', WorkerSchema);

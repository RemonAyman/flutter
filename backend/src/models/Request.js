const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  problemDescription: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);

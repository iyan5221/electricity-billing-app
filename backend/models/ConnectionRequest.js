const mongoose = require('mongoose');

const ConnectionRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestType: { type: String, required: true }, // e.g., "New Connection", "Load Upgrade"
  details: { type: String },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConnectionRequest', ConnectionRequestSchema);

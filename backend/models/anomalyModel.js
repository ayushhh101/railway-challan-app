const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
  message: {
    type: String, required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  challan: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Challan'
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  }
},{ timestamps: true });

module.exports = mongoose.model('Anomaly', anomalySchema);
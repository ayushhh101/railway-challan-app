const mongoose = require('mongoose');

const challanSchema = new mongoose.Schema({
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // TTE
    required: true,
  },
  trainNumber: {
    type: String,
    required: true,
  },
  passengerName: {
    type: String,
    required: true,
  },
  passengerAadharLast4: {
    type: String,
    length: 4,
    match: /^[0-9]{4}$/, // Only 4 digits if provided
    required: false,
  },
  reason: {
    type: String,
    enum: ['No Ticket', 'Fake Ticket', 'Misconduct', 'Overbooking', 'Other'],
    required: true,
  },
  fineAmount: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  },
  paid: {
    type: Boolean,
    default: false
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

challanSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Challan', challanSchema);

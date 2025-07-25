const mongoose = require('mongoose');

const REASON_ENUM = [
  "Travelling without proper pass/ticket",
  "Travelling Fraudulently",
  "Alarm Chain Pulling",
  "Coach Reserved for Handicapped",
  "Travelling on Roof Top",
  "Trespassing",
  "Nuisance and Littering",
  "Bill Pasting",
  "Touting",
  "Unauthorised Hawking"
];

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
  mobileNumber: {
    type: Number,
    length: 10,
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger',
    required: false,
  },
  reason: {
    type: String,
    enum: REASON_ENUM,
    required: true,
  },
  fineAmount: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  latitude: Number,
  longitude: Number,
  paymentMode: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  signature: {
    type: String,
  },
  proofFiles: {
    type: [String],
    default: []
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


module.exports = mongoose.model('Challan', challanSchema);

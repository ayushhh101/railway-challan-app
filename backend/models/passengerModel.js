const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aadharLast4: { type: String, required: true, length: 4, match: /^[0-9]{4}$/ },
  mobileNumber: { type: String, required: true, unique: true },
  passwordHash: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model('Passenger', passengerSchema);

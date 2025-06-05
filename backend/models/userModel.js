const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['tte', 'admin'],
    default: 'tte',
  },
  zone: {
    type: String, // Central, Western, etc.
  },
  lastLogin: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
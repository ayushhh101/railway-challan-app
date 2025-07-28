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
  email :{
    type: String, 
    unique: true, 
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String, 
    unique: true,
  },
  profilePic: String,
  role: {
    type: String,
    enum: ['tte', 'admin'],
    default: 'tte',
  },
  zone: {
    type: String, // Central, Western, etc.
  },
  currentStation: { type: String },
  designation: { type: String },
  dateOfJoining: { type: Date },
  lastLogin: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
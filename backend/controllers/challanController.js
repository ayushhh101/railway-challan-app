const Challan = require('../models/challanModel');

exports.issueChallan = async (req, res) => {
  try {
    const {
      trainNumber,
      passengerName,
      passengerAadhar,
      reason,
      fineAmount,
      location
    } = req.body;

    const newChallan = new Challan({
      issuedBy: req.user.id, // From auth middleware
      trainNumber,
      passengerName,
      passengerAadhar,
      reason,
      fineAmount,
      location
    });

    await newChallan.save();

    res.status(201).json({ message: 'Challan issued successfully', challan: newChallan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

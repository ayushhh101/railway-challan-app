const Challan = require('../models/challanModel');
const User = require('../models/userModel');

exports.issueChallan = async (req, res) => {
  try {
    const {
      trainNumber,
      passengerName,
      passengerAadharLast4, // last 4 digits only
      reason,
      fineAmount,
      location
    } = req.body;

    if (!trainNumber || !passengerName || !reason || !fineAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (passengerAadharLast4 && passengerAadharLast4.length !== 4) {
      return res.status(400).json({ message: 'Aadhar must be last 4 digits only' });
    }

    //create challan
    const newChallan = new Challan({
      issuedBy: req.user.id, //set by authMiddleware
      trainNumber,
      passengerName,
      passengerAadharLast4,
      reason,
      fineAmount,
      location // { type: "Point", coordinates: [lng, lat] }
    });

    console.log("User issuing challan:", req.user); 
    await newChallan.save();

    res.status(201).json({
      message: 'Challan issued successfully',
      challan: newChallan
    });

  } catch (error) {
    console.error("Error issuing challan:", error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllChallans = async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate('issuedBy', 'name employeeId role zone') // show TTE details
      .sort({ issuedAt: -1 }); // newest first

    res.status(200).json({ total: challans.length, challans });
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

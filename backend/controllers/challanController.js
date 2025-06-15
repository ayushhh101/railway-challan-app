const Challan = require('../models/challanModel');
const User = require('../models/userModel');
const Station = require('../models/stationModel');

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

    // lookup station lat/lng
    const station = await Station.findOne({ name: location });

    if (!station) {
      return res.status(404).json({ message: "Station not found in records" });
    }

    //creates challan
    const newChallan = new Challan({
      issuedBy: req.user.id, //set by authMiddleware
      trainNumber,
      passengerName,
      passengerAadharLast4,
      reason,
      fineAmount,
      location,
      latitude: station.latitude,
      longitude: station.longitude,
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

// for admin to view all challans
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

// for TTE to view their own challans
exports.getMyChallans = async (req, res) => {
  try {
    const challans = await Challan.find({ issuedBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(challans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching challans', error: err.message });
  }
};

// get challan locations
exports.getChallanLocations = async (req, res) => {
   try {
    const result = await Challan.aggregate([
      {
        $group: {
          _id: { lat: "$latitude", lng: "$longitude" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          latitude: "$_id.lat",
          longitude: "$_id.lng",
          count: 1
        }
      }
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error fetching challan location heatmap data:", error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.searchChallans = async (req, res) => {
  const { passenger, train, reason, date , status } = req.query;

  const filter = {};
  if (passenger) filter.passengerName = { $regex: passenger, $options: 'i' };
  if (train) filter.trainNumber = train;
  if (reason) filter.reason = { $regex: reason, $options: 'i' };
  if (date) filter.createdAt = {
    $gte: new Date(date),
    $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
  };
  if (status === 'paid') filter.paid = true;
  if (status === 'unpaid') filter.paid = false;

  const challans = await Challan.find(filter).populate('issuedBy', 'name');
  res.json(challans);
};

exports.getChallanDetails = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('issuedBy'); // assuming 'issuedBy' references TTE

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    res.status(200).json({
      passengerName: challan.passengerName,
      trainNumber: challan.trainNumber,
      reason: challan.reason,
      fineAmount: challan.fineAmount,
      createdAt: challan.createdAt,
      isPaid: challan.isPaid,
      receiptUrl: challan.receiptUrl || `localhost:5173/api/pdf/challan/${challan._id}/pdf`,
      tte: {
        name: challan.issuedBy.name,
        employeeId: challan.issuedBy.employeeId,
      },
    });
  } catch (err) {
    console.error('Challan detail fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

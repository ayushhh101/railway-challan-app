const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const Anomaly = require('../models/anomalyModel');

router.get('/dashboard', verifyToken , isAdmin, getDashboardStats);

router.get('/anomalies' , verifyToken, isAdmin, async (req, res) => {
  const anomalies = await Anomaly.find().sort({ timestamp: -1}).populate('user' , '_id name employeeId role zone').populate('challan', '_id issuedBy trainNumber passengerName passengerAadharLast4 reason fineAmount location paymentMode paid issuedAt').exec();
  res.json({anomalies});
});

module.exports = router;

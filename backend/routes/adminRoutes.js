const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyReport, getTTEAnalytics } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const Anomaly = require('../models/anomalyModel');
const { updateAnomaly } = require('../controllers/challanController');
const { getAllAudits } = require('../controllers/auditController');

router.get('/dashboard', verifyToken , isAdmin, getDashboardStats);

router.get('/anomalies' , verifyToken, isAdmin, async (req, res) => {
  const anomalies = await Anomaly.find().sort({ timestamp: -1}).populate('user' , '_id name employeeId role zone').populate('challan', '_id issuedBy trainNumber passengerName passengerAadharLast4 reason fineAmount location paymentMode paid issuedAt').exec();
  res.json({anomalies});
});

router.put('/anomalies/:anomalyId/:status', verifyToken, isAdmin, updateAnomaly);

router.get('/getAllAudits', verifyToken, isAdmin ,getAllAudits);

router.get('/monthly-report', verifyToken, isAdmin ,getMonthlyReport);

router.get('/getTTEAnalytics', verifyToken, isAdmin , getTTEAnalytics);

module.exports = router;

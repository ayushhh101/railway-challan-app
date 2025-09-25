const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyReport, getTTEAnalytics, adminResetPassword, dashboardValidation, monthlyReportValidation, tteAnalyticsValidation, resetPasswordValidation } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const Anomaly = require('../models/anomalyModel');
const { updateAnomaly } = require('../controllers/challanController');
const { getAllAudits } = require('../controllers/auditController');

router.get('/dashboard', verifyToken , isAdmin, dashboardValidation,getDashboardStats);

router.get('/anomalies' , verifyToken, isAdmin, async (req, res) => {
  const anomalies = await Anomaly.find().sort({ timestamp: -1}).populate('user' , '_id name employeeId role zone').populate('challan', '_id issuedBy trainNumber passengerName passengerAadharLast4 reason fineAmount location paymentMode paid issuedAt').exec();
  res.json({anomalies});
});

router.put('/anomalies/:anomalyId/:status', verifyToken, isAdmin, updateAnomaly);

router.get('/getAllAudits', verifyToken, isAdmin ,getAllAudits);

router.get('/monthly-report', verifyToken, isAdmin , monthlyReportValidation, getMonthlyReport);

router.get('/getTTEAnalytics', verifyToken, isAdmin , tteAnalyticsValidation, getTTEAnalytics);

router.post('/reset-password', verifyToken, isAdmin, resetPasswordValidation, adminResetPassword);


module.exports = router;

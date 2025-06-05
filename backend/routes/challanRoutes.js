const express = require('express');
const router = express.Router();
const { issueChallan,getAllChallans } = require('../controllers/challanController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// View all challans (Admin only)
router.get('/', verifyToken, isAdmin, getAllChallans);

// Issue challan (TTE only)
router.post('/issue', verifyToken, isTTE, issueChallan);

module.exports = router;

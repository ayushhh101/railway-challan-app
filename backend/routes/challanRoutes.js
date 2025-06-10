const express = require('express');
const router = express.Router();
const { issueChallan,getAllChallans,getMyChallans } = require('../controllers/challanController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// View all challans (Admin only)
router.get('/admin/all', verifyToken, isAdmin, getAllChallans);

// View my challans (TTE only)
router.get('/my', verifyToken, isTTE, getMyChallans);

// Issue challan (TTE only)
router.post('/issue', verifyToken, isTTE, issueChallan);

module.exports = router;

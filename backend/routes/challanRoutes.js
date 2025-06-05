const express = require('express');
const router = express.Router();
const { issueChallan } = require('../controllers/challanController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');

router.post('/issue', verifyToken, isTTE, issueChallan);

module.exports = router;

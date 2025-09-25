const express = require('express');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const { getTTEstats, getTTEProfile, getTTEProfileValidation } = require('../controllers/tteController');
const router = express.Router();

router.get('/tteProfile', verifyToken, isTTE, getTTEProfileValidation ,getTTEProfile)

module.exports = router;
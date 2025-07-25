const express = require('express');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const { getTTEstats, getTTEProfile } = require('../controllers/tteController');
const router = express.Router();

router.get('/tteProfile', verifyToken, isTTE, getTTEProfile)

module.exports = router;
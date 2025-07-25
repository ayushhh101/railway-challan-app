const express = require('express');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const { getTTEstats } = require('../controllers/tteController');
const router = express.Router();

router.get('/tteStats', verifyToken, isTTE, getTTEstats)

module.exports = router;
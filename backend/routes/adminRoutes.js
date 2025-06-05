const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware'); // Your JWT verify middleware
const isAdmin = require('../middleware/isAdmin');

router.get('/dashboard', verifyToken , isAdmin, getDashboardStats);

module.exports = router;

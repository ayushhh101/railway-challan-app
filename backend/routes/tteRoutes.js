const express = require('express');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const { getTTEstats, getTTEProfile, getTTEProfileValidation, getTTEDetailsForAdmin, updateTTEProfileValidation, updateTTEProfileByAdmin } = require('../controllers/tteController');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

router.get('/tteProfile', verifyToken, isTTE, getTTEProfileValidation, getTTEProfile)

router.get('/admin/:id', verifyToken, isAdmin, getTTEDetailsForAdmin
);

router.put('/admin/:id', verifyToken, isAdmin, updateTTEProfileValidation, updateTTEProfileByAdmin
);

module.exports = router;
const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout } = require('../controllers/authController');
const isAdmin = require('../middleware/isAdmin');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', verifyToken , isAdmin, register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, registerValidation, loginValidation, refreshTokenValidation, logoutValidation } = require('../controllers/authController');
const isAdmin = require('../middleware/isAdmin');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', verifyToken , isAdmin, registerValidation,register);
router.post('/login', loginValidation,login);
router.post('/refresh', refreshTokenValidation,refreshToken);
router.post('/logout', logoutValidation,logout);

module.exports = router;

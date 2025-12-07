const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, registerValidation, loginValidation, refreshTokenValidation, logoutValidation } = require('../controllers/authController');
const isAdmin = require('../middleware/isAdmin');
const { verifyToken } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');

router.post('/register', verifyToken , isAdmin, registerValidation,register);
router.post('/login',  
  rateLimiter({
    keyPrefix: 'rl:login',
    windowSec: 60,
    maxRequests: 5,
    getId: (req) => req.ip, // in prod behind proxy you'd use X-Forwarded-For etc.
  }), loginValidation,login);
router.post('/refresh', refreshTokenValidation,refreshToken);
router.post('/logout', logoutValidation,logout);

module.exports = router;

const express = require("express");
const router = express.Router();
const { verifyOnboardingToken, setPasswordAndCompleteOnboarding } = require("../controllers/passengerOnboardingController");
const { verifyToken } = require("../middleware/authMiddleware");
const { login, refreshToken, logout } = require("../controllers/passengerAuthController");

// Verify onboarding token - returns passenger info if token valid
router.get("/onboard-verify", verifyOnboardingToken);

// Set password and complete onboarding
router.post("/onboard-setpassword", setPasswordAndCompleteOnboarding);

router.post('/login' ,login);
router.post('/refresh',refreshToken );
router.post('/logout,verifyToken',logout);


module.exports = router;

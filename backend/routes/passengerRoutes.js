const express = require("express");
const router = express.Router();
const { verifyOnboardingToken, setPasswordAndCompleteOnboarding } = require("../controllers/passengerOnboardingController");
const {  verifyPassengerToken } = require("../middleware/authMiddleware");
const { login, refreshToken, logout } = require("../controllers/passengerAuthController");
const { myChallans } = require("../controllers/passengerController");

// Verify onboarding token - returns passenger info if token valid
router.get("/onboard-verify", verifyOnboardingToken);

// Set password and complete onboarding
router.post("/onboard-setpassword", setPasswordAndCompleteOnboarding);

router.post('/login' ,login);
router.post('/refresh',refreshToken );
router.post('/logout,verifyToken',logout);

router.get('/mychallans',verifyPassengerToken,myChallans)


module.exports = router;

const express = require("express");
const router = express.Router();
const { verifyOnboardingToken, setPasswordAndCompleteOnboarding } = require("../controllers/passengerOnboardingController");
const { verifyPassengerToken } = require("../middleware/authMiddleware");
const { login, refreshToken, logout, loginValidation, refreshTokenValidation, logoutValidation } = require("../controllers/passengerAuthController");
const { myChallans, myChallansValidation } = require("../controllers/passengerController");

// Verify onboarding token - returns passenger info if token valid
router.get("/onboard-verify", verifyOnboardingToken);

// Set password and complete onboarding
router.post("/onboard-setpassword", setPasswordAndCompleteOnboarding);

router.post('/login', loginValidation, login);
router.post('/refresh', refreshTokenValidation, refreshToken);
router.post('/logout,verifyToken', logoutValidation, logout);

router.get('/mychallans', verifyPassengerToken, myChallansValidation,myChallans)


module.exports = router;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Passenger = require("../models/passengerModel");

// Secrets for onboarding tokens - keep in `.env`
const ONBOARDING_SECRET = process.env.PASSENGER_ONBOARD_SECRET ;

// @desc Verify the onboarding token and return passenger info for onboarding UI
// @route GET /api/passenger/onboard-verify?token=...
// @access Public (via token)
exports.verifyOnboardingToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    // Verify token (expires after configured time)
    const payload = jwt.verify(token, ONBOARDING_SECRET);

    // Find passenger, exclude passwordHash for security
    const passenger = await Passenger.findById(payload.passengerId).select(
      "-passwordHash -__v -createdAt -updatedAt"
    );

    if (!passenger) return res.status(404).json({ message: "Passenger not found" });

    // If passenger already has a password, onboarding may be complete
    if (passenger.passwordHash) {
      return res.status(400).json({ message: "Passenger already onboarded" });
    }

    res.json({ passenger });
  } catch (err) {
    // Could be token expired or malformed
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// @desc Set passenger password and complete onboarding
// @route POST /api/passenger/onboard-setpassword
// @access Public (via token)
exports.setPasswordAndCompleteOnboarding = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  try {
    // Verify token to get passengerId
    const payload = jwt.verify(token, ONBOARDING_SECRET);

    const passenger = await Passenger.findById(payload.passengerId);
    if (!passenger) return res.status(404).json({ message: "Passenger not found" });

    // If password is already set, prevent reset via onboarding link
    if (passenger.passwordHash) {
      return res.status(400).json({ message: "Password already set. Onboarding complete." });
    }

    // Hash new password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    passenger.passwordHash = hashedPassword;

    await passenger.save();

    res.json({ message: "Password set successfully. Onboarding complete." });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

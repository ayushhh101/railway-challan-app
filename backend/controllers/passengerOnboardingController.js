const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Passenger = require("../models/passengerModel");

const ONBOARDING_SECRET = process.env.PASSENGER_ONBOARD_SECRET;

exports.verifyOnboardingToken = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    const error = ErrorResponses.missingFields("Token is required");
    return res.status(error.statusCode).json(error);
  }


  try {
    // verify token (expires after configured time)
    const payload = jwt.verify(token, ONBOARDING_SECRET);

    // Find passenger, exclude passwordHash for security
    const passenger = await Passenger.findById(payload.passengerId).select(
      "-passwordHash -__v -createdAt -updatedAt"
    );

    if (!passenger) {
      const error = ErrorResponses.passengerNotFound();
      return res.status(error.statusCode).json(error);
    }

    if (passenger.passwordHash) {
      const error = ErrorResponses.operationNotAllowed("Passenger already onboarded");
      return res.status(error.statusCode).json(error);
    }

    res.json({ passenger });
  } catch (err) {
    const error = ErrorResponses.tokenInvalid("Invalid or expired token");
    return res.status(error.statusCode).json(error);
  }
};

exports.setPasswordAndCompleteOnboarding = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    const error = ErrorResponses.missingFields("Token and password are required");
    return res.status(error.statusCode).json(error);
  }
  if (password.length < 8) {
    const error = ErrorResponses.validationError("Password must be at least 8 characters");
    return res.status(error.statusCode).json(error);
  }

  try {
    // verify token to get passengerId
    const payload = jwt.verify(token, ONBOARDING_SECRET);

    const passenger = await Passenger.findById(payload.passengerId);
    if (!passenger) {
      const error = ErrorResponses.passengerNotFound();
      return res.status(error.statusCode).json(error);
    }

    if (passenger.passwordHash) {
      const error = ErrorResponses.operationNotAllowed("Password already set. Onboarding complete.");
      return res.status(error.statusCode).json(error);
    }

    // Hash new password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    passenger.passwordHash = hashedPassword;

    await passenger.save();

    res.json({ message: "Password set successfully. Onboarding complete." });
  } catch (err) {
    const error = ErrorResponses.tokenInvalid("Invalid or expired token");
    return res.status(error.statusCode).json(error);
  }
};

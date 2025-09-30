const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Passenger = require("../models/passengerModel");
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors, sanitizeInput } = require('../middleware/fieldValidator');
const { body, query } = require('express-validator');

const ONBOARDING_SECRET = process.env.PASSENGER_ONBOARD_SECRET;

// Validation middlewares
const verifyOnboardingTokenValidation = [
  sanitizeInput,
  validateFields({
    query: ['token'],
    body: []
  }),
  // Enhanced token validation
  query('token')
    .notEmpty()
    .withMessage('Token is required')
    .isString()
    .withMessage('Token must be a string')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Token length invalid')
    .matches(/^[A-Za-z0-9\-_\.]+$/)
    .withMessage('Token contains invalid characters'),

  handleValidationErrors
];

const setPasswordValidation = [
  sanitizeInput, // ⚠️ CRITICAL: Add XSS protection
  validateFields({
    query: [],
    body: ['token', 'password']
  }),

  // Enhanced token validation
  body('token')
    .notEmpty()
    .withMessage('Token is required')
    .isString()
    .withMessage('Token must be a string')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Token length invalid')
    .matches(/^[A-Za-z0-9\-_\.]+$/)
    .withMessage('Token contains invalid characters'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom((value) => {
      // Additional security checks
      const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
      if (commonPasswords.some(common => value.toLowerCase().includes(common))) {
        throw new Error('Password is too common');
      }
      return true;
    }),

  handleValidationErrors
];

exports.verifyOnboardingToken = async (req, res) => {
  const { token } = req.query;

  try {
    // verify token (expires after configured time)
    const payload = jwt.verify(token, ONBOARDING_SECRET);

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

exports.verifyOnboardingTokenValidation = verifyOnboardingTokenValidation;
exports.setPasswordValidation = setPasswordValidation;
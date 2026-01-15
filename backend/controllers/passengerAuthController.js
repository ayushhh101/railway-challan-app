const Passenger = require('../models/passengerModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logAudit = require('../utils/auditLogger');
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors, sanitizeInput } = require('../middleware/fieldValidator');
const { commonValidations } = require('../middleware/commonValidations');
const { body } = require('express-validator');


const generateOnboardingToken = (passengerId) => {
  return jwt.sign(
    { passengerId },
    process.env.PASSENGER_ONBOARD_SECRET,
    { expiresIn: '1d' }
  );
};

const generateAccessToken = (passenger) => {
  return jwt.sign({ id: passenger._id, role: 'passenger' }, process.env.PASSENGER_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (passenger) => {
  return jwt.sign({ id: passenger._id, role: 'passenger' }, process.env.PASSENGER_REFRESH_SECRET, { expiresIn: '7d' });
};

async function sendOnboardingNotification(mobileNumber, name, onboardingUrl) {
  try {
    console.log(`Sending onboarding SMS to +91${mobileNumber}:`);
    console.log(`Hello ${name}, you have a challan. Register here: ${onboardingUrl}`);
  } catch (error) {
    console.error('Error sending onboarding notification:', error);
  }
}

const registerValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: ['name', 'aadharLast4', 'mobileNumber', 'password']
  }),
  commonValidations.requiredString('name'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .escape(),

  body('aadharLast4')
    .isLength({ min: 4, max: 4 })
    .withMessage('Aadhar must be exactly 4 digits')
    .isNumeric()
    .withMessage('Aadhar must contain only numbers')
    .custom(async (value, { req }) => {
      const existingPassenger = await Passenger.findOne({
        aadharLast4: value,
        name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') }
      });
      if (existingPassenger) {
        throw new Error('Passenger with this name and Aadhar already exists');
      }
      return true;
    }),
  body('mobileNumber')
    .isMobilePhone('en-IN')
    .withMessage('Mobile number must be a valid 10-digit Indian number')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits')
    .custom(async (value) => {
      const existingPassenger = await Passenger.findOne({ mobileNumber: value });
      if (existingPassenger) {
        throw new Error('Mobile number already registered');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

const loginValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: ['mobileNumber', 'password']
  }),
  body('mobileNumber')
    .isMobilePhone('en-IN')
    .withMessage('Mobile number must be a valid 10-digit Indian number')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password length invalid'),
  commonValidations.requiredString('password'),
  handleValidationErrors
];

const refreshTokenValidation = [
  validateFields({
    query: [],
    body: []
  }),
  handleValidationErrors
];

const logoutValidation = [
  validateFields({
    query: [],
    body: []
  }),
  handleValidationErrors
];

const resetPasswordValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: ['mobileNumber', 'newPassword']
  }),
  body('mobileNumber')
    .isMobilePhone('en-IN')
    .withMessage('Mobile number must be a valid 10-digit Indian number')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits'),
  commonValidations.password('newPassword'),
  handleValidationErrors
];

// Controller functions
exports.register = async (req, res) => {
  try {
    const { name, aadharLast4, mobileNumber, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const newPassenger = new Passenger({
      name,
      aadharLast4,
      mobileNumber,
      passwordHash: hashedPassword,
    });

    await newPassenger.save();

    await logAudit({
      action: 'PASSENGER_REGISTER',
      performedBy: newPassenger._id,
      role: 'passenger',
      metadata: { mobileNumber },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'low',
    });
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Passenger registration error:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

//TODO: add audit log
exports.login = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const passenger = await Passenger.findOne({ mobileNumber });
    if (!passenger) {
      const error = ErrorResponses.passengerNotFound();
      return res.status(error.statusCode).json(error);
    }

    if (!passenger.passwordHash) {
      const now = Date.now();
      const cooldownMinutes = 5;
      let onboardingToken = passenger.lastOnboardingToken;
      let shouldSend = false;

      if (
        !passenger.lastOnboardingTokenSent ||
        now - new Date(passenger.lastOnboardingTokenSent).getTime() > cooldownMinutes * 60 * 1000
      ) {
        onboardingToken = generateOnboardingToken(passenger._id);
        passenger.lastOnboardingTokenSent = new Date(now);
        passenger.lastOnboardingToken = onboardingToken;
        shouldSend = true;

        passenger.save().catch(console.error);
      }

      const onboardingUrl = `${process.env.FRONTEND_URL}/passenger/onboard?token=${onboardingToken}`;

      if (shouldSend) {
        await sendOnboardingNotification(passenger.mobileNumber, passenger.name, onboardingUrl);
      }
      return res.status(400).json({
        message: shouldSend
          ? 'Passenger must complete onboarding before login. Onboarding link has been sent.'
          : `Please wait ${cooldownMinutes} minutes before resending onboarding link.`,
        onboardingToken,
        onboardingUrl,
        cooldownActive: !shouldSend,
        nextAllowed: shouldSend
          ? null
          : new Date(new Date(passenger.lastOnboardingTokenSent).getTime() + cooldownMinutes * 60 * 1000),
      });
    }

    const isMatch = await bcrypt.compare(password, passenger.passwordHash);
    if (!isMatch) {
      const error = ErrorResponses.invalidCredentials();
      return res.status(error.statusCode).json(error);
    }

    const accessToken = generateAccessToken(passenger);
    const refreshToken = generateRefreshToken(passenger);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    try {
      await logAudit({
        action: 'PASSENGER_LOGIN',
        performedBy: passenger._id,
        role: 'passenger',
        metadata: { mobileNumber },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'SUCCESS',
        severity: 'low',
      });
    } catch (err) {
      console.warn("Audit logging failed:", err);
    }

    return res.status(200).json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: passenger._id,
        name: passenger.name,
        mobileNumber: passenger.mobileNumber,
        role: 'passenger',
      },
    });


  } catch (err) {
    console.error('Passenger login error:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    const error = ErrorResponses.unauthorized('Refresh token is required');
    return res.status(error.statusCode).json(error);
  }

  try {
    const payload = jwt.verify(token, process.env.PASSENGER_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    const error = ErrorResponses.tokenInvalid();
    return res.status(error.statusCode).json(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.resetPassword = async (req, res) => {
  const { mobileNumber, newPassword } = req.body;

  try {
    const passenger = await Passenger.findOne({ mobileNumber });
    if (!passenger) {
      const error = ErrorResponses.passengerNotFound();
      return res.status(error.statusCode).json(error);
    }

    const hash = await bcrypt.hash(newPassword, 10);
    passenger.passwordHash = hash;
    await passenger.save();

    res.json({ message: 'Password reset successfully by staff.' });
  } catch (err) {
    console.error('Reset password error:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.registerValidation = registerValidation;
exports.loginValidation = loginValidation;
exports.refreshTokenValidation = refreshTokenValidation;
exports.logoutValidation = logoutValidation;
exports.resetPasswordValidation = resetPasswordValidation;
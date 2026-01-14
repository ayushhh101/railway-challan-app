const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logAudit = require('../utils/auditLogger');
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors, sanitizeInput } = require('../middleware/fieldValidator');
const { commonValidations } = require('../middleware/commonValidations');
const { body } = require('express-validator');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      employeeId: user.employeeId
    },
    process.env.ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
};

const registerValidation = [
  validateFields({
    query: [],
    body: ['name', 'employeeId', 'email', 'password', 'phone', 'profilePic', 'role', 'zone', 'currentStation', 'designation', 'dateOfJoining']
  }),
  commonValidations.requiredString('name'),
  commonValidations.requiredString('employeeId'),

  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .escape(),

  body('employeeId')
    .trim()
    .custom(async (value) => {
      const existingUser = await User.findOne({ employeeId: value });
      if (existingUser) {
        throw new Error('Employee ID already exists');
      }
      return true;
    }),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .isLength({ max: 254 })
    .withMessage('Email must be less than 254 characters')
    .custom(async (value) => {
      if (value) {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error('Email already exists');
        }
      }
      return true;
    }),

  commonValidations.password('password'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Phone must be a valid mobile number'),
  body('profilePic')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Profile picture must be a string'),
  body('role')
    .isIn(['tte', 'admin'])
    .withMessage('Role must be either tte or admin'),
  commonValidations.requiredString('zone'),
  body('currentStation')
    .optional()
    .isString()
    .withMessage('Current station must be a string'),
  body('designation')
    .optional()
    .isString()
    .withMessage('Designation must be a string'),
  body('dateOfJoining')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date of joining must be a valid date'),
  handleValidationErrors
];

const loginValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: ['employeeId', 'password']
  }),
  commonValidations.requiredString('employeeId'),
  commonValidations.requiredString('password'),
  handleValidationErrors
];

const refreshTokenValidation = [
  validateFields({
    query: [],
    body: []
  })
];

const logoutValidation = [
  validateFields({
    query: [],
    body: []
  }),
  handleValidationErrors
];

// controller functions
exports.register = async (req, res) => {
  try {
    const { name, employeeId, email, password, phone, profilePic, role, zone, currentStation, designation, dateOfJoining } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      employeeId,
      email: email || null,
      password: hashedPassword,
      phone: phone || null,
      profilePic: profilePic || null,
      role,
      zone,
      currentStation: currentStation || null,
      designation: designation || null,
      dateOfJoining: dateOfJoining || new Date(),
    });

    await newUser.save();

    await logAudit({
      action: 'USER_REGISTERED',
      performedBy: req.user?.id || null, 
      role:role,
      metadata: {
        newUserEmployeeId: employeeId,
        newUserRole: role,
        newUserZone: zone
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'medium',
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        employeeId: newUser.employeeId,
        name: newUser.name,
        role: newUser.role,
        zone: newUser.zone
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    const user = await User.findOne({ employeeId });
    //TODO: log this
    if (!user) {
      const error = ErrorResponses.userNotFound();
      return res.status(error.statusCode).json(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = ErrorResponses.invalidCredentials();
      return res.status(error.statusCode).json(error);
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // use https
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 din
    });

    await logAudit({
      action: 'LOGGED_IN',
      performedBy: user._id,
      role: user.role,
      metadata: {
        employeeId: user.employeeId,
      },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'low'
    });

    res.status(200).json({
      message: 'Login successful',
      token: accessToken,
      user: {
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        zone: user.zone
      },
      
    });

  } catch (err) {
    console.error('Login error:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.registerValidation = registerValidation;
exports.loginValidation = loginValidation;
exports.refreshTokenValidation = refreshTokenValidation;
exports.logoutValidation = logoutValidation;
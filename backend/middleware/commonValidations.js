const { query, body, param } = require('express-validator');

const commonValidations = {
  // MongoDB ObjectId validation
  mongoId: (fieldName, location = 'body') => {
    let validator;
    if (location === 'query') {
      validator = query(fieldName);
    } else if (location === 'param') {
      validator = param(fieldName);
    } else {
      validator = body(fieldName);
    }
    return validator
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage(`${fieldName} must be a valid MongoDB ObjectId`);
  },

  // Month validation (01-12)
  month: () => query('month')
    .matches(/^(0[1-9]|1[0-2])$/)
    .withMessage('Month must be in format 01-12'),

  // Year validation (4 digits)
  year: () => query('year')
    .matches(/^\d{4}$/)
    .withMessage('Year must be a 4-digit number'),

  // Password validation
  password: (fieldName = 'password') => body(fieldName)
    .isLength({ min: 8 })
    .withMessage(`${fieldName} must be at least 8 characters long`)
    .isString()
    .withMessage(`${fieldName} must be a string`),

  // Required string validation
  requiredString: (fieldName, location = 'body') => {
    const validator = location === 'query' ? query(fieldName) : body(fieldName);
    return validator
      .notEmpty()
      .withMessage(`${fieldName} is required`)
      .isString()
      .withMessage(`${fieldName} must be a string`);
  },

  // Email validation with sanitization
  email: (fieldName = 'email', location = 'body') => {
    const validator = location === 'query' ? query(fieldName) : body(fieldName);
    return validator
      .isEmail()
      .withMessage(`${fieldName} must be a valid email`)
      .normalizeEmail()
      .trim();
  },

  // User role validation
  userRole: (fieldName = 'role') => body(fieldName)
    .isIn(['admin', 'tte', 'passenger'])
    .withMessage(`${fieldName} must be one of: admin, tte, passenger`),

  // Employee ID validation
  employeeId: (fieldName = 'employeeId') => body(fieldName)
    .matches(/^[A-Z]{2}\d{6}$/)
    .withMessage(`${fieldName} must be in format: XX123456 (2 letters + 6 digits)`),

  // Zone validation
  zone: (fieldName = 'zone') => body(fieldName)
    .isIn(['Harbour', 'TransHarbour', 'Eastern', 'Western', 'Central'])
    .withMessage(`${fieldName} must be a valid railway zone`),

  // Phone number validation
  phoneNumber: (fieldName = 'phoneNumber') => body(fieldName)
    .matches(/^[6-9]\d{9}$/)
    .withMessage(`${fieldName} must be a valid 10-digit Indian mobile number`),

  // Name validation with sanitization
  name: (fieldName = 'name', location = 'body') => {
    const validator = location === 'query' ? query(fieldName) : body(fieldName);
    return validator
      .isLength({ min: 2, max: 50 })
      .withMessage(`${fieldName} must be between 2 and 50 characters`)
      .matches(/^[a-zA-Z\s.'-]+$/)
      .withMessage(`${fieldName} can only contain letters, spaces, dots, apostrophes, and hyphens`)
      .trim()
      .escape();
  },

  // Fine amount validation
  fineAmount: (fieldName = 'fineAmount') => body(fieldName)
    .isFloat({ min: 1, max: 50000 })
    .withMessage(`${fieldName} must be between ₹1 and ₹50,000`)
    .toFloat(),

  // Date range validation
  dateRange: () => [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('startDate must be a valid ISO date')
      .toDate(),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('endDate must be a valid ISO date')
      .toDate()
      .custom((value, { req }) => {
        if (req.query.startDate && value < new Date(req.query.startDate)) {
          throw new Error('endDate must be after startDate');
        }
        return true;
      })
  ],

  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100')
      .toInt()
  ],

  // Status validation
  status: (fieldName = 'status', allowedValues = ['active', 'inactive']) => body(fieldName)
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`)
};

module.exports = { commonValidations };

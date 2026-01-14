const { query, body, param } = require('express-validator');

const commonValidations = {
  // mongoDB objectId
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

  month: () => query('month')
    .matches(/^(0[1-9]|1[0-2])$/)
    .withMessage('Month must be in format 01-12'),

  year: () => query('year')
    .matches(/^\d{4}$/)
    .withMessage('Year must be a 4-digit number'),

  password: (fieldName = 'password') => body(fieldName)
    .isLength({ min: 8 })
    .withMessage(`${fieldName} must be at least 8 characters long`)
    .isString()
    .withMessage(`${fieldName} must be a string`),

  requiredString: (fieldName, location = 'body') => {
    const validator = location === 'query' ? query(fieldName) : body(fieldName);
    return validator
      .notEmpty()
      .withMessage(`${fieldName} is required`)
      .isString()
      .withMessage(`${fieldName} must be a string`);
  },

  email: (fieldName = 'email', location = 'body') => {
    const validator = location === 'query' ? query(fieldName) : body(fieldName);
    return validator
      .isEmail()
      .withMessage(`${fieldName} must be a valid email`)
      .normalizeEmail()
      .trim();
  },

  userRole: (fieldName = 'role') => body(fieldName)
    .isIn(['admin', 'tte', 'passenger'])
    .withMessage(`${fieldName} must be one of: admin, tte, passenger`),

  employeeId: (fieldName = 'employeeId') => body(fieldName)
    .matches(/^[A-Z]{2}\d{6}$/)
    .withMessage(`${fieldName} must be in format: XX123456 (2 letters + 6 digits)`),

  zone: (fieldName = 'zone') => body(fieldName)
    .isIn(['Harbour', 'TransHarbour', 'Eastern', 'Western', 'Central'])
    .withMessage(`${fieldName} must be a valid railway zone`),

  phoneNumber: (fieldName = 'phoneNumber') => body(fieldName)
    .matches(/^[6-9]\d{9}$/)
    .withMessage(`${fieldName} must be a valid 10-digit Indian mobile number`),

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

  fineAmount: (fieldName = 'fineAmount') => body(fieldName)
    .isFloat({ min: 1, max: 50000 })
    .withMessage(`${fieldName} must be between ₹1 and ₹50,000`)
    .toFloat(),

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

  status: (fieldName = 'status', allowedValues = ['active', 'inactive', 'retired']) => body(fieldName)
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`),

  coachNumber: (fieldName = 'coachNumber') => body(fieldName)
    .optional()
    .matches(/^[A-Z0-9]{1,6}$/)
    .withMessage(`${fieldName} must be alphanumeric, max 6 characters`),

  aadharLast4: (fieldName = 'passengerAadharLast4') => body(fieldName)
  .optional()
  .matches(/^[0-9]{4}$/)
  .withMessage(`${fieldName} must be exactly 4 digits`),

  signature: (fieldName = 'signature') => body(fieldName)
  .optional()
  .matches(/^data:image\/(jpeg|jpg|png|gif);base64,[A-Za-z0-9+/=]+$/)
  .withMessage(`${fieldName} must be a valid base64 image string`),
};

module.exports = { commonValidations };

const { query, body, param } = require('express-validator');

/**
 * Common validation rules that can be reused across controllers
 */
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
  }
};

module.exports = { commonValidations };

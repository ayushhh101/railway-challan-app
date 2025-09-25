const { ErrorResponses } = require('../utils/errorResponses');

/**
 * Simple middleware to validate allowed fields and prevent extra fields
 * Usage: validateFields({ query: ['month', 'year'], body: ['userId', 'password'] })
 */
const validateFields = (allowedFields = {}) => {
  return (req, res, next) => {
    try {
      // Check query parameters
      if (allowedFields.query !== undefined) {
        const actualQueryFields = Object.keys(req.query || {});
        const extraQueryFields = actualQueryFields.filter(
          field => !allowedFields.query.includes(field)
        );
        
        if (extraQueryFields.length > 0) {
          const error = ErrorResponses.validationError(
            `Unexpected query fields: ${extraQueryFields.join(', ')}`
          );
          return res.status(error.statusCode).json(error);
        }
      }

      // Check body fields
      if (allowedFields.body !== undefined) {
        const actualBodyFields = Object.keys(req.body || {});
        const extraBodyFields = actualBodyFields.filter(
          field => !allowedFields.body.includes(field)
        );
        
        if (extraBodyFields.length > 0) {
          const error = ErrorResponses.validationError(
            `Unexpected body fields: ${extraBodyFields.join(', ')}`
          );
          return res.status(error.statusCode).json(error);
        }
      }

      next(); // All good, proceed
    } catch (error) {
      console.error('Field validation error:', error);
      const serverError = ErrorResponses.serverError();
      return res.status(serverError.statusCode).json(serverError);
    }
  };
};

/**
 * Middleware to handle express-validator errors in a consistent way
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const error = ErrorResponses.validationError(firstError.msg);
    return res.status(error.statusCode).json(error);
  }
  
  next();
};

module.exports = {
  validateFields,
  handleValidationErrors
};

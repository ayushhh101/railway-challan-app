const { ErrorResponses } = require('../utils/errorResponses');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

//validate allowed fields and prevent extra fields
const validateFields = (allowedFields = {}) => {
  return (req, res, next) => {
    try {
      // check query parameters
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

      // check body fields
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

      next();
    } catch (error) {
      console.error('Field validation error:', error);
      const serverError = ErrorResponses.serverError();
      return res.status(serverError.statusCode).json(serverError);
    }
  };
};

//handle express validator errors in a consistent way
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

const sanitizeInput = (req, res, next) => {
  try {
    // remove any keys that start with $ or contain .
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.query);
    mongoSanitize.sanitize(req.params);

    // xss protection for string values
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);

    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};


module.exports = {
  validateFields,
  handleValidationErrors,
  sanitizeInput
};

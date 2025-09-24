const ERROR_CODES = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCESS_DENIED: 'ACCESS_DENIED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Resource Management
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Business Logic
  CHALLAN_ALREADY_PAID: 'CHALLAN_ALREADY_PAID',
  CHALLAN_NOT_FOUND: 'CHALLAN_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PASSENGER_NOT_FOUND: 'PASSENGER_NOT_FOUND',
  PASSENGER_NOT_ONBOARDED: 'PASSENGER_NOT_ONBOARDED',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  
  // File Operations
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // System Errors
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
};

const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid username or password',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please login again',
  [ERROR_CODES.TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.ACCESS_DENIED]: 'You do not have permission to access this resource',
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.MISSING_FIELDS]: 'Required fields are missing',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid data format provided',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'This record already exists',
  
  [ERROR_CODES.NOT_FOUND]: 'Requested resource not found',
  [ERROR_CODES.ALREADY_EXISTS]: 'Resource already exists',
  
  [ERROR_CODES.CHALLAN_ALREADY_PAID]: 'This challan has already been paid',
  [ERROR_CODES.CHALLAN_NOT_FOUND]: 'Challan not found',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.PASSENGER_NOT_FOUND]: 'Passenger not found',
  [ERROR_CODES.PASSENGER_NOT_ONBOARDED]: 'Please complete your registration first',
  [ERROR_CODES.OPERATION_NOT_ALLOWED]: 'This operation is not allowed',
  
  [ERROR_CODES.FILE_UPLOAD_ERROR]: 'Failed to upload file',
  [ERROR_CODES.FILE_NOT_FOUND]: 'File not found',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Invalid file type',
  
  [ERROR_CODES.SERVER_ERROR]: 'Something went wrong. Please try again later',
  [ERROR_CODES.DATABASE_ERROR]: 'Database error occurred. Please try again',
};

// Helper function to create consistent error responses
const createErrorResponse = (errorCode, customMessage = null, statusCode = 500) => {
  return {
    success: false,
    error: {
      code: errorCode,
      message: customMessage || ERROR_MESSAGES[errorCode] || 'An error occurred',
      timestamp: new Date().toISOString()
    },
    statusCode
  };
};

// Quick error response functions
const ErrorResponses = {
  // 400 errors
  validationError: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.VALIDATION_ERROR, customMessage, 400),
  
  missingFields: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.MISSING_FIELDS, customMessage, 400),
  
  invalidFormat: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.INVALID_FORMAT, customMessage, 400),
  
  // 401 errors
  unauthorized: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.UNAUTHORIZED, customMessage, 401),
  
  invalidCredentials: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.INVALID_CREDENTIALS, customMessage, 401),
  
  tokenExpired: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.TOKEN_EXPIRED, customMessage, 401),
  
  tokenInvalid: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.TOKEN_INVALID, customMessage, 401),
  
  // 403 errors
  accessDenied: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.ACCESS_DENIED, customMessage, 403),
  
  // 404 errors
  notFound: (resource = 'Resource', customMessage = null) => 
    createErrorResponse(ERROR_CODES.NOT_FOUND, customMessage || `${resource} not found`, 404),
  
  challanNotFound: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.CHALLAN_NOT_FOUND, customMessage, 404),
  
  userNotFound: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.USER_NOT_FOUND, customMessage, 404),
  
  passengerNotFound: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.PASSENGER_NOT_FOUND, customMessage, 404),
  
  // 409 errors
  alreadyExists: (resource = 'Resource', customMessage = null) => 
    createErrorResponse(ERROR_CODES.ALREADY_EXISTS, customMessage || `${resource} already exists`, 409),
  
  challanAlreadyPaid: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.CHALLAN_ALREADY_PAID, customMessage, 409),
  
  // 500 errors
  serverError: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.SERVER_ERROR, customMessage, 500),
  
  databaseError: (customMessage = null) => 
    createErrorResponse(ERROR_CODES.DATABASE_ERROR, customMessage, 500),
};

module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES,
  ErrorResponses,
  createErrorResponse
};
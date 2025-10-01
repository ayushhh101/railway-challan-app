const Challan = require('../models/challanModel');
const User = require('../models/userModel');
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors, sanitizeInput } = require('../middleware/fieldValidator');
const { body, param } = require('express-validator');
const { commonValidations } = require('../middleware/commonValidations');

const getTTEProfileValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: [],
    param: []
  }),
  handleValidationErrors
];

const updateTTEProfileValidation = [
  sanitizeInput,
  param('id')
    .trim()
    .notEmpty()
    .withMessage('TTE ID is required')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid TTE ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .escape(),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters')
    .custom(async (value, { req }) => {
      const existingUser = await User.findOne({
        email: value,
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        throw new Error('Email already exists');
      }
      return true;
    }),

  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9][0-9]{9}$/)
    .withMessage('Phone must be a valid 10-digit Indian number starting with 6-9'),

  body('zone')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Zone is required and must not exceed 20 characters')
    .matches(/^[A-Z\s]+$/)
    .withMessage('Zone must contain only uppercase letters and spaces'),

  body('currentStation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Current station must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Station name can only contain letters, spaces, and hyphens'),

  // Designation validation
  body('designation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Designation must be between 2 and 30 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Designation can only contain letters, spaces, and hyphens'),

  // Date of joining validation
  body('dateOfJoining')
    .optional()
    .isISO8601()
    .withMessage('Date of joining must be a valid date')
    .toDate()
    .custom((value) => {
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      if (value > oneYearFromNow) {
        throw new Error('Date of joining cannot be more than 1 year in the future');
      }

      const minDate = new Date('1950-01-01');
      if (value < minDate) {
        throw new Error('Date of joining cannot be before 1950');
      }

      return true;
    }),

  handleValidationErrors
];


exports.getTTEProfile = async (req, res) => {
  try {
    const tteId = req.user.id;

    const tte = await User.findById(tteId).lean();

    if (!tte) {
      const error = ErrorResponses.userNotFound('TTE not found or inactive');
      return res.status(error.statusCode).json(error);
    }

    const challans = await Challan.find({ issuedBy: tteId }).sort({ issuedAt: -1 });
    const total = challans.length;
    const paid = challans.filter(c => c.paid).length;
    const unpaid = total - paid;
    const recovery = total ? Math.round((paid / total) * 100) : 0;
    const recent = challans.slice(0, 10);

    res.json({
      profile: {
        name: tte.name,
        employeeId: tte.employeeId,
        email: tte.email || "",
        phone: tte.phone || "",
        profilePic: tte.profilePic || null,
        role: tte.role,
        zone: tte.zone || "N/A",
        currentStation: tte.currentStation || "",
        designation: tte.designation || "",
        dateOfJoining: tte.dateOfJoining || "",
        lastLogin: tte.lastLogin,
      },
      stats: { total, paid, unpaid, recovery },
      recentChallans: recent,
    });
  } catch (error) {
    console.error("Failed to fetch TTE profile:", error);
    const errRes = ErrorResponses.serverError();
    return res.status(errRes.statusCode).json(errRes);
  }
}

exports.getTTEDetailsForAdmin = async (req, res) => {
  try {
    const tteId = req.params.id;

    const tte = await User.findOne({
      _id: tteId,
      role: 'tte'
    })
      .select('-password -__v -tokenVersion')
      .lean();

    if (!tte) {
      const error = ErrorResponses.userNotFound('TTE not found');
      return res.status(error.statusCode).json(error);
    }

    res.status(200).json({
      status: 'success',
      message: 'TTE details retrieved successfully',
      data: {
        profile: tte
      }
    });

  } catch (error) {
    console.error('Get TTE details error:', error);

    if (error.name === 'CastError') {
      const validationError = ErrorResponses.validationError('Invalid TTE ID format');
      return res.status(validationError.statusCode).json(validationError);
    }

    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.updateTTEProfileByAdmin = async (req, res) => {
  try {
    const tteId = req.params.id;
    const updateData = req.body;

    // Check if at least one field is provided
    const allowedFields = ['name', 'email', 'phone', 'zone', 'currentStation', 'designation', 'dateOfJoining'];
    const fieldsToUpdate = Object.keys(updateData).filter(field => allowedFields.includes(field));

    if (fieldsToUpdate.length === 0) {
      const error = ErrorResponses.validationError('At least one field must be provided for update');
      return res.status(error.statusCode).json(error);
    }

    const tte = await User.findOne({
      _id: tteId,
      role: 'tte'
    });

    if (!tte) {
      const error = ErrorResponses.userNotFound('TTE not found');
      return res.status(error.statusCode).json(error);
    }

    // Store original values for audit (only for fields being updated)
    const originalData = {};
    const updatedFields = {};

    // Update only the provided fields
    fieldsToUpdate.forEach(field => {
      originalData[field] = tte[field];

      switch (field) {
        case 'name':
          tte.name = updateData.name.trim();
          updatedFields.name = tte.name;
          break;
        case 'email':
          tte.email = updateData.email.trim().toLowerCase();
          updatedFields.email = tte.email;
          break;
        case 'phone':
          tte.phone = updateData.phone.trim();
          updatedFields.phone = tte.phone.substring(0, 6) + '****'; // Masked for audit
          break;
        case 'zone':
          tte.zone = updateData.zone.trim().toUpperCase();
          updatedFields.zone = tte.zone;
          break;
        case 'currentStation':
          tte.currentStation = updateData.currentStation.trim();
          updatedFields.currentStation = tte.currentStation;
          break;
        case 'designation':
          tte.designation = updateData.designation.trim();
          updatedFields.designation = tte.designation;
          break;
        case 'dateOfJoining':
          tte.dateOfJoining = new Date(updateData.dateOfJoining);
          updatedFields.dateOfJoining = tte.dateOfJoining;
          break;
      }
    });

    tte.updatedAt = new Date();
    await tte.save();

    // Log audit trail with only updated fields
    try {
      const logAudit = require('../utils/auditLogger');
      await logAudit({
        action: 'TTE_PROFILE_PARTIAL_UPDATE_BY_ADMIN',
        performedBy: req.user.id,
        targetUser: tteId,
        role: 'admin',
        metadata: {
          fieldsUpdated: fieldsToUpdate,
          originalData,
          updatedData: updatedFields
        },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'SUCCESS',
        severity: 'medium'
      });
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }

    // Return updated profile (excluding sensitive data)
    const updatedProfile = {
      _id: tte._id,
      name: tte.name,
      employeeId: tte.employeeId,
      email: tte.email,
      phone: tte.phone ? tte.phone.substring(0, 6) + '****' : '',
      role: tte.role,
      zone: tte.zone,
      currentStation: tte.currentStation,
      designation: tte.designation,
      dateOfJoining: tte.dateOfJoining,
      isActive: tte.isActive,
      lastLogin: tte.lastLogin,
      updatedAt: tte.updatedAt
    };

    res.status(200).json({
      success: true,
      message: `TTE profile updated successfully. Fields updated: ${fieldsToUpdate.join(', ')}`,
      data: {
        profile: updatedProfile,
        updatedFields: fieldsToUpdate
      }
    });

  } catch (error) {
    console.error('Update TTE profile error:', error);

    if (error.name === 'CastError') {
      const validationError = ErrorResponses.validationError('Invalid TTE ID format');
      return res.status(validationError.statusCode).json(validationError);
    }

    if (error.name === 'ValidationError') {
      const validationError = ErrorResponses.validationError(error.message);
      return res.status(validationError.statusCode).json(validationError);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const validationError = ErrorResponses.validationError(`${field} already exists`);
      return res.status(validationError.statusCode).json(validationError);
    }

    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

// Export validation middleware
exports.getTTEProfileValidation = getTTEProfileValidation;
exports.updateTTEProfileValidation = updateTTEProfileValidation;
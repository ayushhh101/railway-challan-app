const Challan = require('../models/challanModel');
const generateChallanPDF = require('../utils/generateChallanPDF');
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors, sanitizeInput } = require('../middleware/fieldValidator');
const { commonValidations } = require('../middleware/commonValidations');
const { param } = require('express-validator');

const downloadChallanPDFValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: [],
    param: ['id']
  }),
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Challan ID is required')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Challan ID must be a valid MongoDB ObjectId'),
  handleValidationErrors
];


exports.downloadChallanPDF = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('issuedBy');

    if (!challan) {
      const error = ErrorResponses.challanNotFound();
      return res.status(error.statusCode).json(error);
    }

    const pdfBuffer = await generateChallanPDF(challan);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=challan-${challan._id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log(`PDF downloaded: ${challanId} by ${req.user.role}:${req.user.id} at ${new Date().toISOString()}`);

    res.status(200).end(pdfBuffer); // sends raw buffer
  } catch (err) {
    console.error('PDF generation error:', err);
    const error = ErrorResponses.serverError();
    return res.status(error.statusCode).json(error);
  }
};

exports.downloadChallanPDFValidation = downloadChallanPDFValidation;
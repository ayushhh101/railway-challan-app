const Challan = require('../models/challanModel');
const generateChallanPDF = require('../utils/generateChallanPDF');
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors } = require('../middleware/fieldValidator');
const { commonValidations } = require('../middleware/commonValidations');
const { param } = require('express-validator');

const downloadChallanPDFValidation = [
  validateFields({ 
    query: [], 
    body: [] 
  }),
  param('id')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Challan ID must be a valid MongoDB ObjectId'),
  handleValidationErrors
];


exports.downloadChallanPDF = async (req, res) => {
  try {
    //req.params.id is the challan ID which is extracted from the route
    const challan = await Challan.findById(req.params.id).populate('issuedBy');
    if (!challan) {
      const error = ErrorResponses.challanNotFound();
      return res.status(error.statusCode).json(error);
    }

    const pdfBuffer = await generateChallanPDF(challan);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=challan-${challan._id}.pdf`);
    res.status(200).end(pdfBuffer); // sends raw buffer
  } catch (err) {
    console.error('PDF generation error:', err);
    const error = ErrorResponses.serverError();
    return res.status(error.statusCode).json(error);
  }
};

exports.downloadChallanPDFValidation = downloadChallanPDFValidation;
const express = require('express');
const router = express.Router();
const { downloadChallanPDF, downloadChallanPDFValidation } = require('../controllers/pdfController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');

router.get('/challan/:id/pdf', verifyToken,downloadChallanPDFValidation,downloadChallanPDF);

module.exports = router;

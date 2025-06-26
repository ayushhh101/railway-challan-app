const express = require('express');
const router = express.Router();
const { downloadChallanPDF } = require('../controllers/pdfController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');

router.get('/challan/:id/pdf', verifyToken,downloadChallanPDF);

module.exports = router;

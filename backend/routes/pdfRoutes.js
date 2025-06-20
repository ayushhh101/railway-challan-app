const express = require('express');
const router = express.Router();
const { downloadChallanPDF } = require('../controllers/pdfController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');

router.get('/challan/:id/pdf', verifyToken, isTTE ,downloadChallanPDF);

module.exports = router;

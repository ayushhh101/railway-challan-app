const express = require('express');
const router = express.Router();
const { issueChallan, getAllChallans, getMyChallans, getChallanLocations, searchChallans, getChallanDetails, downloadBulkChallanPDF, updateChallan, getChallan, userHistory, markChallanAsPaid, getPassengerHistory, issueChallanValidation, getAllChallansValidation, getMyChallansValidation, getChallanLocationsValidation, searchChallansValidation, getChallanDetailsValidation, downloadBulkPDFValidation, getPassengerHistoryValidation, updateChallanValidation, userHistoryValidation, getChallanValidation, markChallanAsPaidValidation } = require('../controllers/challanController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const uploadProof = require('../middleware/uploadProof');

// View all challans (Admin only)
router.get('/admin/all', verifyToken, isAdmin, getAllChallansValidation, getAllChallans);

// View my challans (TC only)
router.get('/my', verifyToken, isTTE, getMyChallansValidation, getMyChallans);

// Issue challan (TC only)
router.post('/issue', verifyToken, isTTE, uploadProof.array('proofs', 4), issueChallanValidation, issueChallan);

// Get challan locations (Admin only)
router.get('/locations', verifyToken, isAdmin, getChallanLocationsValidation, getChallanLocations);

// (Admin only)
router.get('/search', verifyToken, isAdmin, searchChallansValidation, searchChallans);

// Get challan details by ID (Admin only)
router.get('/details/:id', verifyToken, isAdmin, getChallanDetailsValidation, getChallanDetails);

// Download bulk challan PDF (Admin only)
router.post('/bulk-pdf', verifyToken, isAdmin, downloadBulkPDFValidation, downloadBulkChallanPDF);

router.get('/passenger-history', verifyToken, getPassengerHistoryValidation, getPassengerHistory)

router.get('/history', userHistoryValidation, userHistory)

router.put('/pay/:id', markChallanAsPaidValidation,markChallanAsPaid)

router.put('/:id', verifyToken, isTTE, updateChallanValidation, updateChallan)

router.get('/:id', getChallanValidation,getChallan)

module.exports = router;

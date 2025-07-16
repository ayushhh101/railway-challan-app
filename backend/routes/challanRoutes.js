const express = require('express');
const router = express.Router();
const { issueChallan,getAllChallans,getMyChallans, getChallanLocations, searchChallans, getChallanDetails, downloadBulkChallanPDF, updateChallan, getChallan, userHistory, markChallanAsPaid } = require('../controllers/challanController');
const { verifyToken, isTTE } = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// View all challans (Admin only)
router.get('/admin/all', verifyToken, isAdmin, getAllChallans);

// View my challans (TTE only)
router.get('/my', verifyToken, isTTE, getMyChallans);

// Issue challan (TTE only)
router.post('/issue', verifyToken, isTTE, issueChallan);

// Get challan locations (Admin only)
router.get('/locations', verifyToken, isAdmin ,getChallanLocations);

// Search challans (Admin only)
router.get('/search', verifyToken,isAdmin , searchChallans);

// Get challan details by ID (Admin only)
router.get('/details/:id', verifyToken, isAdmin , getChallanDetails);

// Download bulk challan PDF (Admin only)
router.post('/bulk-pdf', verifyToken, isAdmin, downloadBulkChallanPDF);

router.put('/:id', verifyToken, isTTE , updateChallan)

router.get('/history',  userHistory )

router.get('/:id', getChallan)

router.put('/pay/:id', markChallanAsPaid)




module.exports = router;

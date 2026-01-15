const Challan = require('../models/challanModel');
const User = require('../models/userModel');
const Station = require('../models/stationModel');
const Anomaly = require('../models/anomalyModel');
const archiver = require('archiver');
const puppeteer = require('puppeteer');
const { default: mongoose } = require('mongoose');
const logAudit = require('../utils/auditLogger');
const Passenger = require('../models/passengerModel');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors, sanitizeInput } = require('../middleware/fieldValidator');
const { commonValidations } = require('../middleware/commonValidations');
const { body, query, param } = require('express-validator');

//redis
const { getCache, setCache, delCacheKey } = require('../utils/cache');

const PASSENGER_ONBOARD_SECRET = process.env.PASSENGER_ONBOARD_SECRET;

function generateOnboardingToken(passengerId) {
  return jwt.sign({ passengerId }, PASSENGER_ONBOARD_SECRET, { expiresIn: '24h' });
}

async function sendOnboardingNotification(mobileNumber, name, onboardingUrl) {
  // TODO:integration with SMS/email provider here
  console.log(`Sending onboarding SMS to +91${mobileNumber}:`);
  console.log(`Hello ${name}, you have a challan. Register here: ${onboardingUrl}`);
}

// validations
const issueChallanValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: ['trainNumber', 'coachNumber', 'passengerName', 'passengerAadharLast4', 'mobileNumber', 'reason', 'fineAmount', 'location', 'paymentMode', 'paid', 'signature', 'proofFiles']
  }),
  commonValidations.requiredString('trainNumber'),
  body('trainNumber')
    .matches(/^[A-Za-z0-9\s-]+$/)
    .withMessage('Train number contains invalid characters'),
  body('coachNumber')
    .optional()
    .isString()
    .withMessage('Coach number must be a string'),
  commonValidations.requiredString('passengerName'),
  body('passengerName')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Passenger name can only contain letters and spaces'),
  body('passengerAadharLast4')
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('Aadhar must be exactly 4 digits')
    .isNumeric()
    .withMessage('Aadhar must contain only numbers'),
  body('mobileNumber')
    .optional()
    .custom((value) => {
      if (value && !validator.isMobilePhone(value.toString(), 'en-IN')) {
        throw new Error('Mobile number must be a valid 10-digit Indian number');
      }
      return true;
    }),
  commonValidations.requiredString('reason'),
  body('fineAmount')
    .isNumeric()
    .withMessage('Fine amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Fine amount must be positive'),
  commonValidations.requiredString('location'),
  body('paymentMode')
    .isIn(['online', 'offline'])
    .withMessage("Payment mode must be 'online' or 'offline'"),
  body('paid')
    .optional()
    .isBoolean()
    .withMessage('Paid must be a boolean'),
  body('signature')
    .optional()
    .isString()
    .withMessage('Signature must be a base64 image string'),
  handleValidationErrors
];

const getAllChallansValidation = [
  validateFields({ query: [], body: [] })
];

const getMyChallansValidation = [
  validateFields({ query: [], body: [] })
];

const getChallanLocationsValidation = [
  validateFields({ query: [], body: [] })
];

const searchChallansValidation = [
  sanitizeInput,
  validateFields({
    query: ['passenger', 'train', 'reason', 'date', 'status'],
    body: []
  }),
  query('passenger')
    .optional()
    .isString()
    .trim()
    .escape()
    .withMessage('Passenger must be a string'),
  query('train')
    .optional()
    .isString()
    .withMessage('Train must be a string'),
  query('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  query('status')
    .optional()
    .isIn(['paid', 'unpaid'])
    .withMessage('Status must be either paid or unpaid'),
  handleValidationErrors
];

const getChallanDetailsValidation = [
  validateFields({ query: [], body: [] }),
  commonValidations.mongoId('id', 'param'),
  handleValidationErrors
];

const downloadBulkPDFValidation = [
  sanitizeInput,
  validateFields({ query: [], body: ['challanIds'] }),
  body('challanIds')
    .isArray({ min: 1 })
    .withMessage('challanIds must be a non-empty array'),
  body('challanIds.*')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Each challan ID must be a valid MongoDB ObjectId')
    .custom((arr) => {
      if (arr.length > 30) {
        throw new Error('Maximum 30 challans allowed for bulk download');
      }
      return true;
    }),

  handleValidationErrors
];

const updateChallanValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: ['trainNumber', 'passengerName', 'passengerAadhar', 'reason', 'fineAmount', 'location']
  }),
  commonValidations.mongoId('id', 'param'),
  body('trainNumber')
    .optional()
    .isString()
    .matches(/^[A-Za-z0-9\s-]+$/)
    .withMessage('Train number contains invalid characters'),
  body('passengerName')
    .optional()
    .isString()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Passenger name can only contain letters and spaces'),
  body('passengerAadhar')
    .optional()
    .isString(),
  body('reason')
    .optional()
    .isString(),
  body('fineAmount')
    .optional()
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Fine amount must be positive'),
  body('location')
    .optional()
    .isString(),
  handleValidationErrors
];

const updateAnomalyValidation = [
  validateFields({ query: [], body: [] }),
  param('anomalyId')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Anomaly ID must be a valid MongoDB ObjectId'),
  param('status')
    .isIn(['resolved', 'dismissed'])
    .withMessage('Status must be either resolved or dismissed'),
  handleValidationErrors
];

const getChallanValidation = [
  validateFields({ query: [], body: [] }),
  commonValidations.mongoId('id', 'param'),
  handleValidationErrors
];

const userHistoryValidation = [
  sanitizeInput,
  validateFields({ query: ['name', 'aadhar'], body: [] }),
  query('name')
    .optional()
    .isString()
    .withMessage('Name must be a string'),
  query('aadhar')
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('Aadhar must be exactly 4 digits')
    .isNumeric()
    .withMessage('Aadhar must contain only numbers'),
  handleValidationErrors
];

const markChallanAsPaidValidation = [
  validateFields({ query: [], body: [] }),
  commonValidations.mongoId('id', 'param'),
  handleValidationErrors
];

const getPassengerHistoryValidation = [
  sanitizeInput,
  validateFields({
    query: ['name', 'aadharLast4', 'dateFrom', 'dateTo', 'paymentStatus'],
    body: []
  }),
  query('name')
    .optional()
    .isString()
    .withMessage('Name must be a string'),
  query('aadharLast4')
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('Aadhar must be exactly 4 digits')
    .isNumeric()
    .withMessage('Aadhar must contain only numbers'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date'),
  query('paymentStatus')
    .optional()
    .isIn(['paid', 'unpaid'])
    .withMessage('Payment status must be either paid or unpaid'),
  handleValidationErrors
];

// controllers
exports.issueChallan = async (req, res) => {
  try {
    let {
      trainNumber = '',
      coachNumber = '',
      passengerName = '',
      passengerAadharLast4 = '', // last 4 digits only
      mobileNumber = '',
      reason = '',
      fineAmount,
      location = '',
      paymentMode = '',
      paid = false, 
      signature = '',
    } = req.body;

    const normalizedCoachNumber = coachNumber?.toString().toUpperCase().trim() || '';

    if (paid && paymentMode === 'offline' && !signature) {
      const error = ErrorResponses.validationError('Digital signature required for offline payments');
      return res.status(error.statusCode).json(error);
    }

    const proofFiles = req.files?.map(f => f.path) || [];
    if (proofFiles.length > 4) {
      const error = ErrorResponses.validationError('You can upload up to 4 proof files only');
      return res.status(error.statusCode).json(error);
    }
    for (const file of req.files || []) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        const error = ErrorResponses.validationError('Only JPEG and PNG images are allowed');
        return res.status(error.statusCode).json(error);
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        const error = ErrorResponses.validationError('File size must be less than 5MB');
        return res.status(error.statusCode).json(error);
      }
    }

    const escapedLocation = location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const station = await Station.findOne({
      name: { $regex: `^${escapedLocation}$`, $options: 'i' }
    });

    if (!station) {
      const error = ErrorResponses.notFound('Station');
      return res.status(error.statusCode).json(error);
    }

    const existingUser = await Challan.findOne({ passengerAadharLast4 });
    if (existingUser) {
      if (existingUser.passengerName.trim().toLowerCase() !== passengerName.trim().toLowerCase()) {
        const error = ErrorResponses.validationError('Different name for the same Aadhar number');
        return res.status(error.statusCode).json(error);
      }
    }

    let passengerUser = null;
    let shouldSendOnboarding = false;

    if (mobileNumber && passengerAadharLast4) {
      passengerUser = await Passenger.findOne({
        mobileNumber: mobileNumber.toString(),
        aadharLast4: passengerAadharLast4
      });
    } else if (mobileNumber) {
      passengerUser = await Passenger.findOne({ mobileNumber: mobileNumber.toString() });
    }

    //onboarding logic
    if (passengerUser) {
      if (!passengerUser.passwordHash) {
        shouldSendOnboarding = true; 
      }
      // otherwise continue as usual to create the challan...
    } else {
      // no existing passenger, create and save new
      passengerUser = new Passenger({
        name: passengerName,
        aadharLast4: passengerAadharLast4 || '',
        mobileNumber: mobileNumber ? mobileNumber.toString() : '',
      });

      try {
        await passengerUser.save();
        console.log(`Created new passenger user for ${passengerName}, mobile ${mobileNumber}`);
        const onboardingToken = generateOnboardingToken(passengerUser._id);
        const onboardingUrl = `${process.env.FRONTEND_URL}/passenger/onboard?token=${onboardingToken}`;
        await sendOnboardingNotification(passengerUser.mobileNumber, passengerUser.name, onboardingUrl);

      } catch (e) {
        console.warn(`Passenger user creation failed: ${e.message}`);
        passengerUser = await Passenger.findOne({
          mobileNumber: mobileNumber.toString(),
          aadharLast4: passengerAadharLast4
        });
        if (passengerUser && !passengerUser.passwordHash) {
        shouldSendOnboarding = true;
        }
      }
    }

    //create challan
    const newChallan = new Challan({
      issuedBy: req.user.id, //set by authMiddleware
      trainNumber,
      coachNumber: normalizedCoachNumber,
      passengerName,
      passengerAadharLast4,
      mobileNumber,
      passenger: passengerUser ? passengerUser._id : undefined,
      reason,
      fineAmount,
      location,
      latitude: station.latitude,
      longitude: station.longitude,
      paymentMode,
      paid,
      signature, // base64 encoded image
      proofFiles
    });

    console.log("User issuing challan:", req.user);
    await newChallan.save();
    await delCacheKey('challans:admin:all');
    await delCacheKey(`challans:tte:${req.user.id}`);

    if (shouldSendOnboarding && passengerUser) {
      const onboardingToken = generateOnboardingToken(passengerUser._id);
      const onboardingUrl = `${process.env.FRONTEND_URL}/passenger/onboard?token=${onboardingToken}`;
      await sendOnboardingNotification(passengerUser.mobileNumber, passengerUser.name, onboardingUrl);
    }

    res.status(201).json({
      message: 'Challan issued successfully',
      challan: newChallan
    });

    await logAudit({
      action: 'ISSUE_CHALLAN',
      performedBy: req.user.id,
      role: req.user.role,
      metadata: {
        challanId: newChallan._id,
        passengerName: newChallan.passengerName,
        fineAmount: newChallan.fineAmount,
        location: newChallan.location,
        paymentMode: newChallan.paymentMode,
        paid: newChallan.paid,
      },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'low',
      status: 'SUCCESS',
    });

    const issuedByUser = await User.findById(req.user.id);
    const userName = issuedByUser.name;
    console.log("Challan issued by:", userName);

    const issuedAtLastHour = await Challan.find({
      issuedBy: req.user.id,
      issuedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (issuedAtLastHour.length > 20) {
      await Anomaly.create({
        message: `TTE ${userName} issued more than 20 challans in the last hour.`,
        user: req.user.id,
        challan: newChallan._id,
        status: 'pending'
      })
    }

    if (fineAmount > 1000) {
      await Anomaly.create({
        message: `High fine amount of ${fineAmount} issued by TTE ${userName}`,
        user: req.user.id,
        challan: newChallan._id,
        status: 'pending'
      });
    }

  } catch (error) {
    console.error('Error issuing challan:', error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

// (admin) to view all challans TODO: pagination 
exports.getAllChallans = async (req, res) => {
  const cacheKey = 'challans:admin:all';
  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    const challans = await Challan.find()
      .populate('issuedBy', 'name employeeId role zone')
      .sort({ issuedAt: -1 }); // newest first

    await setCache(cacheKey, challans, 60);
    res.status(200).json({ total: challans.length, challans });
  } catch (error) {
    console.error('Error fetching all challans:', error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

// (tc) to view their own challans TODO: pagination
exports.getMyChallans = async (req, res) => {
  const cacheKey = `challans:tte:${req.user.id}`;
  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const challans = await Challan.find({ issuedBy: req.user.id }).sort({ createdAt: -1 }).populate('issuedBy');

    await setCache(cacheKey, challans, 60);
    res.status(200).json(challans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching challans', error: err.message });
  }
};

// (heatmap)
exports.getChallanLocations = async (req, res) => {
  try {
    const result = await Challan.aggregate([
      {
        $group: {
          _id: { lat: "$latitude", lng: "$longitude" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          latitude: "$_id.lat",
          longitude: "$_id.lng",
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: result,
      message: 'Challan locations retrieved successfully'
    });
  } catch (error) {
    console.error("Error fetching challan location heatmap data:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// search challans by various criteria
exports.searchChallans = async (req, res) => {
  const { passenger, train, reason, date, status } = req.query;

  const filter = {};
  if (passenger) {
    const escapedPassenger = passenger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.passengerName = { $regex: escapedPassenger, $options: 'i' };
  }
  if (train) filter.trainNumber = train;
  if (reason) {
    const escapedReason = reason.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.reason = { $regex: escapedReason, $options: 'i' };
  }
  if (date) filter.createdAt = {
    $gte: new Date(date),
    $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
  };
  if (status === 'paid') filter.paid = true;
  if (status === 'unpaid') filter.paid = false;

  const challans = await Challan.find(filter).populate('issuedBy', 'name');
  res.json(challans);
};

// get details of a specific challan by ID
exports.getChallanDetails = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('issuedBy'); 

    if (!challan) {
      const error = ErrorResponses.challanNotFound();
      return res.status(error.statusCode).json(error);
    }

    res.status(200).json({
      passengerName: challan.passengerName,
      trainNumber: challan.trainNumber,
      reason: challan.reason,
      fineAmount: challan.fineAmount,
      createdAt: challan.createdAt,
      isPaid: challan.isPaid,
      receiptUrl: challan.receiptUrl || `localhost:5173/api/pdf/challan/${challan._id}/pdf`,
      tte: {
        name: challan.issuedBy.name,
        employeeId: challan.issuedBy.employeeId,
      },
    });
  } catch (err) {
    console.error('Challan detail fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// download bulk challan PDFs as zip file
exports.downloadBulkChallanPDF = async (req, res) => {
  try {
    const { challanIds } = req.body;

    const zip = archiver('zip', { zlib: { level: 9 } });
    res.attachment('challans.zip');
    zip.pipe(res);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    for (const id of challanIds) {
      const challanUrl = `${process.env.CLIENT_URL}/challan-pdf/${id}`;
      await page.goto(challanUrl, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({ format: 'A4' });
      zip.append(pdfBuffer, { name: `challan-${id}.pdf` });
    }

    await browser.close();
    zip.finalize();
  } catch (error) {
    console.error('Error generating bulk PDF:', error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }

};

exports.updateChallan = async (req, res) => {
  try {
    const { id } = req.params;

    const challan = await Challan.findById(id);
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    // Check if TTE owns this challan
    if (challan.issuedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this challan' });
    }

    // update only allowed fields
    const allowedFields = ['trainNumber', 'passengerName', 'passengerAadhar', 'reason', 'fineAmount', 'location'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        challan[field] = req.body[field];
      }
    });

    await challan.save();

    await delCacheKey('challans:admin:all');
    await delCacheKey(`challans:tte:${challan.issuedBy.toString()}`);

    res.json({ message: 'Challan updated successfully', challan });
  } catch (err) {
    console.error('Update Challan Error:', err);
    res.status(500).json({ message: 'Server error while updating challan' });
  }
};

exports.updateAnomaly = async (req, res) => {
  try {
    const { status, anomalyId } = req.params;

    const updatedAnomaly = await Anomaly.findByIdAndUpdate(anomalyId, { status }, { new: true });

    if (!updatedAnomaly) {
      const error = ErrorResponses.notFound('Anomaly');
      return res.status(error.statusCode).json(error);
    }

    res.status(200).json({ message: 'Anomaly updated successfully', anomaly: updatedAnomaly });

  } catch (error) {
    console.error("Error updating anomaly:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChallan = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('issuedBy', 'name employeeId role zone');
    if (!challan) {
      const error = ErrorResponses.challanNotFound();
      return res.status(error.statusCode).json(error);
    }
    res.json({ challan });
  } catch (err) {
    console.error('Error getting challan:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
}

exports.userHistory = async (req, res) => {
  try {
    const name = req.query.name?.trim();
    const aadhar = req.query.aadhar?.trim();

    const challans = await Challan.find({
      passengerName: { $regex: new RegExp(`^${name}$`, 'i') },
      passengerAadharLast4: String(aadhar)
    }).sort({ createdAt: -1 }).populate('issuedBy');

    res.status(200).json({ challans });
  } catch (err) {
    console.error('Error fetching user history:', err);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.markChallanAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const challan = await Challan.findById(id);
    if (!challan) {
      const error = ErrorResponses.challanNotFound();
      return res.status(error.statusCode).json(error);
    }

    if (challan.paid) {
      const error = ErrorResponses.challanAlreadyPaid();
      return res.status(error.statusCode).json(error);
    }

    challan.paid = true;
    await challan.save();
    await delCacheKey('challans:admin:all');
    await delCacheKey(`challans:tte:${challan.issuedBy.toString()}`);


    res.status(200).json({
      message: 'Challan marked as paid successfully',
      challan,
    });

    await logAudit({
      action: 'MARK_CHALLAN_PAID',
      performedBy: req.user.id,
      role: req.user.role,
      metadata: {
        challanId: challan._id,
        passengerName: challan.passengerName,
        fineAmount: challan.fineAmount,
      },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'low',
      status: 'SUCCESS',
    });

  } catch (error) {
    console.error('Error marking challan as paid:', error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
};

exports.getPassengerHistory = async (req, res) => {
  try {
    const { name, aadhar, dateFrom, dateTo, paymentStatus } = req.query;
    name = req.query.name?.trim();
    aadhar = req.query.aadharLast4?.trim();

    const query = {};
    if (name) {
      query.passengerName = { $regex: new RegExp(`^${name}$`, 'i') };
    }
    if (aadhar) {
      query.passengerAadharLast4 = aadhar;
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    if (paymentStatus === "paid") {
      query.paid = true;
    } else if (paymentStatus === "unpaid") {
      query.paid = false;
    }

    const challans = await Challan.find(query)
      .sort({ createdAt: -1 })
      .populate('issuedBy');

    // passenger aggregate stats
    const totalChallans = challans.length;
    const paidCount = challans.filter(c => c.paid).length;
    const unpaidCount = totalChallans - paidCount;
    const totalFine = challans.reduce((acc, c) => acc + (c.fineAmount || 0), 0);

    res.status(200).json({
      challans,
      stats: {
        totalChallans,
        paidCount,
        unpaidCount,
        totalFine,
      }
    });
  } catch (err) {
    console.error('Error fetching user history:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.stack });
  }
}

exports.issueChallanValidation = issueChallanValidation;
exports.getAllChallansValidation = getAllChallansValidation;
exports.getMyChallansValidation = getMyChallansValidation;
exports.getChallanLocationsValidation = getChallanLocationsValidation;
exports.searchChallansValidation = searchChallansValidation;
exports.getChallanDetailsValidation = getChallanDetailsValidation;
exports.downloadBulkPDFValidation = downloadBulkPDFValidation;
exports.updateChallanValidation = updateChallanValidation;
exports.updateAnomalyValidation = updateAnomalyValidation;
exports.getChallanValidation = getChallanValidation;
exports.userHistoryValidation = userHistoryValidation;
exports.markChallanAsPaidValidation = markChallanAsPaidValidation;
exports.getPassengerHistoryValidation = getPassengerHistoryValidation;
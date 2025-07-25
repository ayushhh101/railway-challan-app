const Challan = require('../models/challanModel');
const User = require('../models/userModel');
const Station = require('../models/stationModel');
const Anomaly = require('../models/anomalyModel');
const fs = require('fs');
const archiver = require('archiver');
const puppeteer = require('puppeteer');
const path = require('path');
const { default: mongoose } = require('mongoose');
const logAudit = require('../utils/auditLogger');
const Passenger = require('../models/passengerModel');

exports.issueChallan = async (req, res) => {
  try {
    const {
      trainNumber,
      passengerName,
      passengerAadharLast4, // last 4 digits only
      mobileNumber,
      reason,
      fineAmount,
      location,
      paymentMode,
      paid = false, // default to false if not provided
      signature, // base64 encoded image
    } = req.body;

    if (!trainNumber || !passengerName || !reason || !fineAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (passengerAadharLast4 && passengerAadharLast4.length !== 4) {
      return res.status(400).json({ message: 'Aadhar must be last 4 digits only' });
    }

    const proofFiles = req.files?.map(f => f.path) || [];

    // lookup station lat/lng
    const station = await Station.findOne({ name: location });

    if (!station) {
      return res.status(404).json({ message: "Station not found in records" });
    }

    let passengerUser = null;

    if (mobileNumber && passengerAadharLast4) {
      passengerUser = await Passenger.findOne({
        mobileNumber: mobileNumber.toString(),
        aadharLast4: passengerAadharLast4
      });
    } else if (mobileNumber) {
      passengerUser = await Passenger.findOne({ mobileNumber: mobileNumber.toString() });
    }

    if (!passengerUser) {
      // Create passenger user
      passengerUser = new Passenger({
        name: passengerName,
        aadharLast4: passengerAadharLast4 || '', // store empty string if not provided
        mobileNumber: mobileNumber ? mobileNumber.toString() : '', // string to store uniformly
      });

      try {
        await passengerUser.save();
        console.log(`Created new passenger user for ${passengerName}, mobile ${mobileNumber}`);
      } catch (e) {
        // Handle duplicate or validation errors gracefully (might have race conditions)
        console.warn(`Passenger user creation failed: ${e.message}`);
        passengerUser = await Passenger.findOne({
          mobileNumber: mobileNumber.toString(),
          aadharLast4: passengerAadharLast4
        });
      }
    }

    //creates challan
    const newChallan = new Challan({
      issuedBy: req.user.id, //set by authMiddleware
      trainNumber,
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
    console.error("Error issuing challan:", error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// for admin to view all challans
exports.getAllChallans = async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate('issuedBy', 'name employeeId role zone') // show TTE details
      .sort({ issuedAt: -1 }); // newest first

    res.status(200).json({ total: challans.length, challans });
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// for TTE to view their own challans
exports.getMyChallans = async (req, res) => {
  try {
    const challans = await Challan.find({ issuedBy: req.user.id }).sort({ createdAt: -1 }).populate('issuedBy');
    res.status(200).json(challans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching challans', error: err.message });
  }
};

// get challan locations
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

    res.json(result);
  } catch (error) {
    console.error("Error fetching challan location heatmap data:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Search challans by various criteria
exports.searchChallans = async (req, res) => {
  const { passenger, train, reason, date, status } = req.query;

  const filter = {};
  if (passenger) filter.passengerName = { $regex: passenger, $options: 'i' };
  if (train) filter.trainNumber = train;
  if (reason) filter.reason = { $regex: reason, $options: 'i' };
  if (date) filter.createdAt = {
    $gte: new Date(date),
    $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
  };
  if (status === 'paid') filter.paid = true;
  if (status === 'unpaid') filter.paid = false;

  const challans = await Challan.find(filter).populate('issuedBy', 'name');
  res.json(challans);
};

// Get details of a specific challan by ID
exports.getChallanDetails = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('issuedBy'); // assuming 'issuedBy' references TTE

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
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

// Download bulk challan PDFs as a zip file
exports.downloadBulkChallanPDF = async (req, res) => {
  const { challanIds } = req.body;

  if (!challanIds || !Array.isArray(challanIds)) {
    return res.status(400).json({ message: "challanIds required" });
  }

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
};

exports.updateChallan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid challan ID' });
    }

    const challan = await Challan.findById(id);
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    // Check if TTE owns this challan
    if (challan.issuedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this challan' });
    }

    // Update only allowed fields
    const allowedFields = ['trainNumber', 'passengerName', 'passengerAadhar', 'reason', 'fineAmount', 'location'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        challan[field] = req.body[field];
      }
    });

    await challan.save();

    res.json({ message: 'Challan updated successfully', challan });
  } catch (err) {
    console.error('Update Challan Error:', err);
    res.status(500).json({ message: 'Server error while updating challan' });
  }
};

exports.updateAnomaly = async (req, res) => {
  try {
    const { status, anomalyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(anomalyId)) {
      return res.status(400).json({ message: 'Invalid anomaly ID' });
    }
    const isValidStatus = ['resolved', 'dismissed'].includes(status);
    if (!isValidStatus) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedAnomlay = await Anomaly.findByIdAndUpdate(req.params.anomalyId, { status }, { new: true });
    res.status(200).json({ message: 'Anomaly updated successfully', anomaly: updatedAnomlay });

  } catch (error) {
    console.error("Error updating anomaly:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChallan = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('issuedBy', 'name');
    if (!challan) return res.status(404).json({ message: 'Challan not found' });
    res.json({ challan });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Internal Server Error', error: err.stack });
  }
};

exports.markChallanAsPaid = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id);
    if (!challan) return res.status(404).json({ message: 'Challan not found' });

    challan.paid = true;
    await challan.save();

    res.json({ message: 'Challan marked as paid', challan });
  } catch (err) {
    console.error('Error marking challan as paid:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getPassengerHistory = async (req, res) => {
  try {
    const name = req.query.name?.trim();
    const aadhar = req.query.aadharLast4?.trim();
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const paymentStatus = req.query.paymentStatus;


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


    // Find challans matching query
    const challans = await Challan.find(query)
      .sort({ createdAt: -1 })
      .populate('issuedBy');


    // Aggregate stats for passenger
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
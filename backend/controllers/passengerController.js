const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Passenger = require("../models/passengerModel");
const Challan = require("../models/challanModel");

exports.myChallans = async (req, res) => {
  try {
    // Only fetch challans linked to this passenger
    const challans = await Challan.find({ passenger: req.user.id }).sort({ issuedAt: -1 });
    res.json({ challans });
  } catch (err) {
    console.error("Error fetching passenger challans:", err);
    const error = ErrorResponses.serverError();
    return res.status(error.statusCode).json(error);
  }
}
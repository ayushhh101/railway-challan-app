const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Passenger = require("../models/passengerModel");
const Challan = require("../models/challanModel");
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors } = require('../middleware/fieldValidator');
const { commonValidations } = require('../middleware/commonValidations');

const myChallansValidation = [
  validateFields({
    query: [],
    body: []
  })
];

exports.myChallans = async (req, res) => {
  try {
    // Only fetch challans linked to this passenger
    const challans = await Challan.find({ passenger: req.user.id }).sort({ issuedAt: -1 });
    res.json({
      success: true,
      data: { challans },
      message: 'Passenger challans retrieved successfully'
    });
  } catch (err) {
    console.error("Error fetching passenger challans:", err);
    const error = ErrorResponses.serverError();
    return res.status(error.statusCode).json(error);
  }
}

exports.myChallansValidation = myChallansValidation;
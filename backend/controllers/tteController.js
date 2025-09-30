const Challan = require('../models/challanModel');
const User = require('../models/userModel');
const { ErrorResponses } = require('../utils/errorResponses');
const { validateFields, handleValidationErrors, sanitizeInput } = require('../middleware/fieldValidator');
const { commonValidations } = require('../middleware/commonValidations');

const getTTEProfileValidation = [
  sanitizeInput,
  validateFields({
    query: [],
    body: [],
    param: []
  })
];

exports.getTTEProfile = async (req, res) => {
  try {
    const tteId = req.user.id;

    const tte = await User.findById(tteId).lean();

    if (!tte) {
      const error = ErrorResponses.userNotFound('TTE not found or inactive');
      return res.status(error.statusCode).json(error);
    }

    const challans = await Challan.find({ issuedBy: tteId }).sort({ issuedAt: -1 });
    const total = challans.length;
    const paid = challans.filter(c => c.paid).length;
    const unpaid = total - paid;
    const recovery = total ? Math.round((paid / total) * 100) : 0;
    const recent = challans.slice(0, 10);

    res.json({
      profile: {
        name: tte.name,
        employeeId: tte.employeeId,
        email: tte.email || "",
        phone: tte.phone || "",
        profilePic: tte.profilePic || null,
        role: tte.role,
        zone: tte.zone || "N/A",
        currentStation: tte.currentStation || "",
        designation: tte.designation || "",
        dateOfJoining: tte.dateOfJoining || "",
        lastLogin: tte.lastLogin,
      },
      stats: { total, paid, unpaid, recovery },
      recentChallans: recent,
    });
  } catch (error) {
    console.error("Failed to fetch TTE profile:", error);
    const errRes = ErrorResponses.serverError();
    return res.status(errRes.statusCode).json(errRes);
  }
}

exports.getTTEProfileValidation = getTTEProfileValidation;
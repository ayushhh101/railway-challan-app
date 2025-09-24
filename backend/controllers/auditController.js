const User = require('../models/userModel')
const AuditLog = require('../models/auditModel')

exports.getAllAudits = async (req, res) => {
  try {
    const audits = await AuditLog.find().populate('performedBy', 'name employeeId').
      sort({ createdAt: -1 });
    res.status(200).json({ audits })
  } catch (error) {
    console.error('Audit fetch error:', error);
    const serverError = ErrorResponses.serverError();
    return res.status(serverError.statusCode).json(serverError);
  }
}

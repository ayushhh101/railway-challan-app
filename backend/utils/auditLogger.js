const AuditLog = require('../models/auditModel')

const logAudit = async ({
  action,
  performedBy,
  role,
  metadata = {},
  ipAddress,
  userAgent,
  severity = 'low',
  status = 'SUCCESS'
}) =>{
  try {
     await AuditLog.create({
      action,
      performedBy,
      role,
      metadata,
      ipAddress,
      userAgent,
      severity,
      status,
    });
  } catch (error) {
    console.error('Audit logging failed:', err.message);
  }
}

module.exports = logAudit;
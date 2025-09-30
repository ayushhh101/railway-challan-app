const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['tte', 'admin', 'passenger']},
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  status: { type: String, enum: ['SUCCESS', 'FAILURE', 'PARTIAL'], default: 'SUCCESS' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('AuditLog', auditLogSchema)
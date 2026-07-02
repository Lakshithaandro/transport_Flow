import mongoose from 'mongoose'

const adminActivitySchema = new mongoose.Schema(
  {
    adminUid: { type: String, required: true, index: true },
    adminEmail: { type: String, default: '', trim: true },
    adminName: { type: String, default: '', trim: true },
    action: { type: String, required: true, trim: true, index: true },
    targetType: { type: String, required: true, trim: true, index: true },
    targetId: { type: String, default: '', trim: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '', trim: true },
    userAgent: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)

adminActivitySchema.index({ createdAt: -1 })
adminActivitySchema.index({ adminUid: 1, createdAt: -1 })
adminActivitySchema.index({ targetType: 1, createdAt: -1 })

export default mongoose.model('AdminActivity', adminActivitySchema)

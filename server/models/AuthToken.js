import mongoose from 'mongoose'

const authTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    lastUsedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
)

authTokenSchema.index({ userId: 1, revokedAt: 1 })
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('AuthToken', authTokenSchema)

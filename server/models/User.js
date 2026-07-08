import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, default: '', index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: '' },
    displayName: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    role: { type: String, enum: ['manager', 'admin'], default: 'manager', index: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active', index: true },
    passwordResetRequired: { type: Boolean, default: false },
    passwordResetAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

userSchema.index({ role: 1, status: 1 })
userSchema.index({ createdAt: -1 })

export default mongoose.model('User', userSchema)

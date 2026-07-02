import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    status: { type: String, enum: ['Active', 'Inactive', 'Needs Review'], default: 'Active' },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

customerSchema.index({ createdByUid: 1, phone: 1 }, { unique: true })
customerSchema.index({ createdByUid: 1, status: 1 })

export default mongoose.model('Customer', customerSchema)

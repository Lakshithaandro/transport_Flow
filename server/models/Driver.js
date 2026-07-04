import mongoose from 'mongoose'

const driverDocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'application/pdf', enum: ['application/pdf'] },
    size: { type: Number, default: 0, min: 0 },
    uploadedAt: { type: String, default: '' },
  },
  { _id: false },
)

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseClass: { type: String, enum: ['Class A CDL', 'Class B CDL'], required: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Available', 'Assigned', 'Needs Review'], default: 'Available' },
    assignedVehicle: { type: String, default: 'Unassigned', trim: true },
    licenseExpiry: { type: String, default: '', trim: true },
    emergencyContactName: { type: String, default: '', trim: true },
    emergencyContactPhone: { type: String, default: '', trim: true },
    documents: { type: [driverDocumentSchema], default: [] },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

driverSchema.index({ createdByUid: 1, phone: 1 }, { unique: true })
driverSchema.index({ createdByUid: 1, status: 1 })
driverSchema.index({ createdByUid: 1, licenseExpiry: 1 })

export default mongoose.model('Driver', driverSchema)

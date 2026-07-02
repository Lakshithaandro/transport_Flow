import mongoose from 'mongoose'

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseClass: { type: String, enum: ['Class A CDL', 'Class B CDL'], required: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Available', 'Assigned', 'Needs Review'], default: 'Available' },
    assignedVehicle: { type: String, default: 'Unassigned', trim: true },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

driverSchema.index({ createdByUid: 1, phone: 1 }, { unique: true })
driverSchema.index({ createdByUid: 1, status: 1 })

export default mongoose.model('Driver', driverSchema)

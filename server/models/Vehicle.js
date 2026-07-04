import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema(
  {
    unit: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Tractor', 'Dry Van Trailer', 'Reefer Trailer', 'Flatbed Trailer'], required: true },
    plate: { type: String, required: true, trim: true, uppercase: true },
    status: { type: String, enum: ['Available', 'Assigned', 'Maintenance'], default: 'Available' },
    assignedDriver: { type: String, default: 'Unassigned', trim: true },
    mileage: { type: Number, default: 0, min: 0 },
    insuranceExpiry: { type: String, default: '', trim: true },
    pucExpiry: { type: String, default: '', trim: true },
    permitExpiry: { type: String, default: '', trim: true },
    fitnessCertificateExpiry: { type: String, default: '', trim: true },
    serviceDueDate: { type: String, default: '', trim: true },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

vehicleSchema.index({ createdByUid: 1, plate: 1 }, { unique: true })
vehicleSchema.index({ createdByUid: 1, status: 1 })
vehicleSchema.index({ createdByUid: 1, insuranceExpiry: 1 })
vehicleSchema.index({ createdByUid: 1, permitExpiry: 1 })
vehicleSchema.index({ createdByUid: 1, serviceDueDate: 1 })

export default mongoose.model('Vehicle', vehicleSchema)

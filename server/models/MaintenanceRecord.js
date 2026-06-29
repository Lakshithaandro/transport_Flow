import mongoose from 'mongoose'

const maintenanceRecordSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, trim: true },
    vehicleName: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true, trim: true },
    nextServiceDate: { type: Date, required: true },
    cost: { type: Number, required: true, min: 0 },
    mechanicName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Overdue'],
      default: 'Scheduled',
    },
    reminderDate: { type: Date, required: true },
    notes: { type: String, default: '', trim: true },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema)

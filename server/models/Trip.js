import mongoose from 'mongoose'

const tripSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true, trim: true },
    route: { type: String, required: true, trim: true },
    vehicle: { type: String, required: true, trim: true },
    driver: { type: String, required: true, trim: true },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ['Scheduled', 'In Transit', 'Delayed', 'Completed'], default: 'Scheduled' },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

tripSchema.index({ createdByUid: 1, scheduledDate: 1 })
tripSchema.index({ createdByUid: 1, status: 1 })

export default mongoose.model('Trip', tripSchema)

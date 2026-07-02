import mongoose from 'mongoose'

const routeRecordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    distanceMiles: { type: Number, required: true, min: 1, max: 10000 },
    estimatedHours: { type: Number, required: true, min: 0.25, max: 240 },
    status: { type: String, enum: ['Active', 'Draft', 'Needs Review'], default: 'Draft' },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

routeRecordSchema.index({ createdByUid: 1, status: 1 })
routeRecordSchema.index({ createdByUid: 1, name: 1 })

export default mongoose.model('RouteRecord', routeRecordSchema)

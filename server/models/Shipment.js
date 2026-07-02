import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema(
  {
    shipmentNumber: { type: String, required: true, unique: true, trim: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: '', trim: true, lowercase: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    pickupDate: { type: Date, default: null },
    deliveryDate: { type: Date, default: null },
    status: { type: String, enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'], default: 'Pending', index: true },
    driverName: { type: String, default: '', trim: true },
    vehicleName: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
    createdByUid: { type: String, default: '', index: true },
    createdByEmail: { type: String, default: '' },
    updatedByUid: { type: String, default: '' },
  },
  { timestamps: true },
)

shipmentSchema.index({ status: 1, pickupDate: 1 })
shipmentSchema.index({ customerName: 1 })
shipmentSchema.index({ createdAt: -1 })

export default mongoose.model('Shipment', shipmentSchema)

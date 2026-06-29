import mongoose from 'mongoose'

const fuelLogSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, trim: true },
    vehicleName: { type: String, required: true, trim: true },
    driverId: { type: String, required: true, trim: true },
    driverName: { type: String, required: true, trim: true },
    fuelQuantity: { type: Number, required: true, min: 0 },
    fuelCost: { type: Number, required: true, min: 0 },
    fuelStation: { type: String, required: true, trim: true },
    odometerReading: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    notes: { type: String, default: '', trim: true },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model('FuelLog', fuelLogSchema)

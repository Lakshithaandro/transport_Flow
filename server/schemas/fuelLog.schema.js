import { z } from 'zod'

const requiredString = z.string().trim().min(1)
const optionalNotes = z.string().trim().max(1000).optional().default('')

export const createFuelLogSchema = z.object({
  vehicleId: requiredString,
  vehicleName: requiredString,
  driverId: requiredString,
  driverName: requiredString,
  fuelQuantity: z.coerce.number().positive(),
  fuelCost: z.coerce.number().nonnegative(),
  fuelStation: requiredString,
  odometerReading: z.coerce.number().nonnegative(),
  date: z.coerce.date(),
  notes: optionalNotes,
})

export const updateFuelLogSchema = createFuelLogSchema.partial()

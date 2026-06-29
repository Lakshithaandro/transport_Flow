import { z } from 'zod'

const requiredString = z.string().trim().min(1)
const optionalNotes = z.string().trim().max(1000).optional().default('')

export const maintenanceStatuses = ['Scheduled', 'In Progress', 'Completed', 'Overdue']

export const createMaintenanceSchema = z.object({
  vehicleId: requiredString,
  vehicleName: requiredString,
  serviceType: requiredString,
  nextServiceDate: z.coerce.date(),
  cost: z.coerce.number().nonnegative(),
  mechanicName: requiredString,
  status: z.enum(maintenanceStatuses).default('Scheduled'),
  reminderDate: z.coerce.date(),
  notes: optionalNotes,
})

export const updateMaintenanceSchema = createMaintenanceSchema.partial()

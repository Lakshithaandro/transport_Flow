import { z } from 'zod'
import { hasChronologicalDateRange, isTodayOrFuture } from './dateValidation.js'

const requiredString = z.string().trim().min(1)
const optionalNotes = z.string().trim().max(1000).optional().default('')

export const maintenanceStatuses = ['Scheduled', 'In Progress', 'Completed', 'Overdue']

const maintenanceBaseSchema = z.object({
  vehicleId: requiredString,
  vehicleName: requiredString,
  serviceType: requiredString,
  nextServiceDate: z.coerce.date().refine(isTodayOrFuture, 'Next service date cannot be in the past'),
  cost: z.coerce.number().nonnegative(),
  mechanicName: requiredString,
  status: z.enum(maintenanceStatuses).default('Scheduled'),
  reminderDate: z.coerce.date().refine(isTodayOrFuture, 'Reminder date cannot be in the past'),
  notes: optionalNotes,
})

function hasValidReminderDate(data) {
  return hasChronologicalDateRange(data.reminderDate, data.nextServiceDate)
}

export const createMaintenanceSchema = maintenanceBaseSchema.refine(hasValidReminderDate, {
  message: 'Reminder date cannot be after the next service date',
  path: ['reminderDate'],
})

export const updateMaintenanceSchema = maintenanceBaseSchema.partial().refine(hasValidReminderDate, {
  message: 'Reminder date cannot be after the next service date',
  path: ['reminderDate'],
})

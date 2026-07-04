import { z } from 'zod'

const platePattern = /^[A-Z0-9][A-Z0-9 -]*$/
const businessTextPattern = /^[A-Za-z0-9][A-Za-z0-9 .,_/-]*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const vehicleTypes = ['Tractor', 'Dry Van Trailer', 'Reefer Trailer', 'Flatbed Trailer']
export const vehicleStatuses = ['Available', 'Assigned', 'Maintenance']

function emptyStringToUndefined(value) {
  return typeof value === 'string' && value.trim() === '' ? undefined : value
}

const optionalDateStringSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(datePattern, 'Date must use YYYY-MM-DD format')
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), 'Date must be valid')
    .optional(),
)

const vehicleBaseSchema = z.object({
  unit: z.string().trim().min(2).max(40).regex(businessTextPattern, 'Unit name can only include letters, numbers, spaces, and - _ / . , characters'),
  type: z.enum(vehicleTypes),
  plate: z.string().trim().min(2).max(12).transform((value) => value.toUpperCase().replace(/\s+/g, ' ')).refine((value) => platePattern.test(value), 'Plate can only include letters, numbers, spaces, and hyphens'),
  status: z.enum(vehicleStatuses).default('Available'),
  assignedDriver: z.string().trim().optional().default('Unassigned'),
  mileage: z.coerce.number().nonnegative().optional().default(0),
  insuranceExpiry: optionalDateStringSchema,
  pucExpiry: optionalDateStringSchema,
  permitExpiry: optionalDateStringSchema,
  fitnessCertificateExpiry: optionalDateStringSchema,
  serviceDueDate: optionalDateStringSchema,
})

export const createVehicleSchema = vehicleBaseSchema
export const updateVehicleSchema = vehicleBaseSchema.partial()

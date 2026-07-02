import { z } from 'zod'

const personNamePattern = /^[A-Za-z][A-Za-z .'-]*$/

export const driverLicenseClasses = ['Class A CDL', 'Class B CDL']
export const driverStatuses = ['Available', 'Assigned', 'Needs Review']

function normalizePhone(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

function formatPhone(value) {
  const digits = normalizePhone(value)
  if (digits.length !== 10) return value.trim()
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const driverBaseSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(personNamePattern, 'Driver name can only include letters, spaces, apostrophes, hyphens, and periods'),
  licenseClass: z.enum(driverLicenseClasses),
  phone: z.string().trim().refine((value) => normalizePhone(value).length === 10, 'Phone must include a valid 10-digit phone number').transform(formatPhone),
  status: z.enum(driverStatuses).default('Available'),
  assignedVehicle: z.string().trim().optional().default('Unassigned'),
})

export const createDriverSchema = driverBaseSchema
export const updateDriverSchema = driverBaseSchema.partial()

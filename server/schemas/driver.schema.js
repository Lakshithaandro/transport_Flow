import { z } from 'zod'

const personNamePattern = /^[A-Za-z][A-Za-z .'-]*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const dateTimePattern = /^\d{4}-\d{2}-\d{2}T.*Z$/

export const driverLicenseClasses = ['Class A CDL', 'Class B CDL']
export const driverStatuses = ['Available', 'Assigned', 'Needs Review']

function emptyStringToUndefined(value) {
  return typeof value === 'string' && value.trim() === '' ? undefined : value
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

function formatPhone(value) {
  const digits = normalizePhone(value)
  if (digits.length !== 10) return value.trim()
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
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

const optionalPersonNameSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(personNamePattern, 'Emergency contact name can only include letters, spaces, apostrophes, hyphens, and periods')
    .optional(),
)

const optionalPhoneSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .refine((value) => normalizePhone(value).length === 10, 'Emergency contact phone must include a valid 10-digit phone number')
    .transform(formatPhone)
    .optional(),
)

const driverDocumentSchema = z.object({
  name: z.string().trim().min(1).max(160).regex(/\.pdf$/i, 'Document must be a PDF file'),
  type: z.literal('application/pdf').optional().default('application/pdf'),
  size: z.coerce.number().nonnegative().optional().default(0),
  uploadedAt: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().regex(dateTimePattern, 'Document uploadedAt must be an ISO date-time string').optional(),
  ),
})

const driverBaseSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(personNamePattern, 'Driver name can only include letters, spaces, apostrophes, hyphens, and periods'),
  licenseClass: z.enum(driverLicenseClasses),
  phone: z.string().trim().refine((value) => normalizePhone(value).length === 10, 'Phone must include a valid 10-digit phone number').transform(formatPhone),
  status: z.enum(driverStatuses).default('Available'),
  assignedVehicle: z.string().trim().optional().default('Unassigned'),
  licenseExpiry: optionalDateStringSchema,
  emergencyContactName: optionalPersonNameSchema,
  emergencyContactPhone: optionalPhoneSchema,
  documents: z.array(driverDocumentSchema).optional().default([]),
})

export const createDriverSchema = driverBaseSchema
export const updateDriverSchema = driverBaseSchema.partial()

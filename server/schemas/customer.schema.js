import { z } from 'zod'

const personNamePattern = /^[A-Za-z][A-Za-z .'-]*$/
const companyNamePattern = /^[A-Za-z0-9][A-Za-z0-9 &.',-]*$/

export const customerStatuses = ['Active', 'Inactive', 'Needs Review']

function normalizePhone(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

function formatPhone(value) {
  const digits = normalizePhone(value)
  if (digits.length !== 10) return value.trim()
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const customerBaseSchema = z.object({
  company: z.string().trim().min(2).max(100).regex(companyNamePattern, 'Company can only include letters, numbers, spaces, and common business punctuation'),
  contactName: z.string().trim().min(2).max(80).regex(personNamePattern, 'Contact name can only include letters, spaces, apostrophes, hyphens, and periods'),
  phone: z.string().trim().refine((value) => normalizePhone(value).length === 10, 'Phone must include a valid 10-digit phone number').transform(formatPhone),
  email: z.string().trim().email().or(z.literal('')).optional().default('').transform((value) => value.toLowerCase()),
  status: z.enum(customerStatuses).default('Active'),
})

export const createCustomerSchema = customerBaseSchema
export const updateCustomerSchema = customerBaseSchema.partial()

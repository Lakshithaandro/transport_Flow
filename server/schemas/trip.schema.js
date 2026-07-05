import { z } from 'zod'
import { isTodayOrFuture } from './dateValidation.js'

const personNamePattern = /^[A-Za-z][A-Za-z .'-]*$/
const companyNamePattern = /^[A-Za-z0-9][A-Za-z0-9 &.',-]*$/
const businessTextPattern = /^[A-Za-z0-9][A-Za-z0-9 .,_/-]*$/

export const tripStatuses = ['Scheduled', 'In Transit', 'Delayed', 'Completed']

const tripBaseSchema = z.object({
  customer: z.string().trim().min(2).max(100).regex(companyNamePattern, 'Customer can only include letters, numbers, spaces, and common business punctuation'),
  route: z.string().trim().min(3).max(100).regex(businessTextPattern, 'Route can only include letters, numbers, spaces, and - _ / . , characters'),
  vehicle: z.string().trim().min(2).max(40).regex(businessTextPattern, 'Vehicle can only include letters, numbers, spaces, and - _ / . , characters'),
  driver: z.string().trim().min(2).max(80).regex(personNamePattern, 'Driver can only include letters, spaces, apostrophes, hyphens, and periods'),
  scheduledDate: z.coerce.date().refine(isTodayOrFuture, 'Scheduled date cannot be in the past'),
  status: z.enum(tripStatuses).default('Scheduled'),
})

export const createTripSchema = tripBaseSchema
export const updateTripSchema = tripBaseSchema.partial()

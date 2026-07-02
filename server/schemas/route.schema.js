import { z } from 'zod'

const businessTextPattern = /^[A-Za-z0-9][A-Za-z0-9 .,_/-]*$/
const locationPattern = /^[A-Za-z][A-Za-z .,-]*$/

export const routeStatuses = ['Active', 'Draft', 'Needs Review']

const routeBaseSchema = z.object({
  name: z.string().trim().min(3).max(100).regex(businessTextPattern, 'Route name can only include letters, numbers, spaces, and - _ / . , characters'),
  origin: z.string().trim().min(2).max(80).regex(locationPattern, 'Origin can only include letters, spaces, commas, hyphens, and periods'),
  destination: z.string().trim().min(2).max(80).regex(locationPattern, 'Destination can only include letters, spaces, commas, hyphens, and periods'),
  distanceMiles: z.coerce.number().min(1).max(10000),
  estimatedHours: z.coerce.number().min(0.25).max(240),
  status: z.enum(routeStatuses).default('Draft'),
})

function hasDifferentEndpoints(data) {
  if (!data.origin || !data.destination) return true
  return data.origin.toLowerCase() !== data.destination.toLowerCase()
}

export const createRouteSchema = routeBaseSchema.refine(hasDifferentEndpoints, {
  message: 'Origin and destination must be different',
  path: ['destination'],
})

export const updateRouteSchema = routeBaseSchema.partial().refine(hasDifferentEndpoints, {
  message: 'Origin and destination must be different',
  path: ['destination'],
})

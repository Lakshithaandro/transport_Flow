import { z } from 'zod'
import { paginationQuerySchema } from './adminQuery.schema.js'

export const shipmentStatuses = ['Pending', 'In Transit', 'Delivered', 'Cancelled']

const optionalString = z.string().trim().max(500).optional().default('')
const requiredString = z.string().trim().min(1).max(180)

const shipmentBaseSchema = z.object({
  shipmentNumber: requiredString,
  customerName: requiredString,
  customerEmail: z.string().trim().email().or(z.literal('')).optional().default(''),
  origin: requiredString,
  destination: requiredString,
  pickupDate: z.coerce.date().nullable().optional().default(null),
  deliveryDate: z.coerce.date().nullable().optional().default(null),
  status: z.enum(shipmentStatuses).optional().default('Pending'),
  driverName: optionalString,
  vehicleName: optionalString,
  notes: optionalString,
})

function hasValidDateRange(data) {
  if (!data.pickupDate || !data.deliveryDate) return true
  return data.deliveryDate >= data.pickupDate
}

export const createShipmentSchema = shipmentBaseSchema.refine(hasValidDateRange, {
  message: 'Delivery date cannot be before pickup date',
  path: ['deliveryDate'],
})

export const updateShipmentSchema = shipmentBaseSchema.partial().refine(hasValidDateRange, {
  message: 'Delivery date cannot be before pickup date',
  path: ['deliveryDate'],
})

export const shipmentStatusSchema = z.object({
  status: z.enum(shipmentStatuses),
})

export const shipmentQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['All', ...shipmentStatuses]).optional().default('All'),
  sortBy: z.enum(['shipmentNumber', 'customerName', 'pickupDate', 'deliveryDate', 'createdAt']).optional().default('createdAt'),
})

import { z } from 'zod'
import { hasChronologicalDateRange, isTodayOrFuture } from './dateValidation.js'

const requiredString = z.string().trim().min(1)
const optionalString = z.string().trim().optional().default('')
const rateSchema = z.coerce.number().min(0).max(100).optional().default(0)

const invoiceLineItemSchema = z.object({
  description: requiredString,
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
})

const invoiceBaseSchema = z.object({
  customerId: requiredString,
  customerName: requiredString,
  customerEmail: optionalString,
  tripId: requiredString,
  tripName: requiredString,
  vehicleId: requiredString,
  vehicleName: requiredString,
  issueDate: z.coerce.date().refine(isTodayOrFuture, 'Issue date cannot be in the past'),
  dueDate: z.coerce.date().refine(isTodayOrFuture, 'Due date cannot be in the past'),
  lineItems: z.array(invoiceLineItemSchema).min(1),
  taxRate: rateSchema,
  gstRate: rateSchema,
  discountType: z.enum(['flat', 'percentage']).optional().default('flat'),
  discountValue: z.coerce.number().nonnegative().optional().default(0),
  amountPaid: z.coerce.number().nonnegative().optional().default(0),
  paymentMethod: optionalString,
  paymentDate: z.coerce.date().nullable().optional().refine(isTodayOrFuture, 'Payment date cannot be in the past'),
  notes: z.string().trim().max(1000).optional().default(''),
})

function hasValidDateRange(data) {
  return hasChronologicalDateRange(data.issueDate, data.dueDate)
}

function hasValidDiscount(data) {
  if (data.discountType !== 'percentage') return true
  if (data.discountValue === undefined) return true
  return data.discountValue <= 100
}

export const createInvoiceSchema = invoiceBaseSchema
  .refine(hasValidDateRange, {
    message: 'Due date cannot be before issue date',
    path: ['dueDate'],
  })
  .refine(hasValidDiscount, {
    message: 'Percentage discount cannot exceed 100',
    path: ['discountValue'],
  })

export const updateInvoiceSchema = invoiceBaseSchema
  .partial()
  .refine(hasValidDateRange, {
    message: 'Due date cannot be before issue date',
    path: ['dueDate'],
  })
  .refine(hasValidDiscount, {
    message: 'Percentage discount cannot exceed 100',
    path: ['discountValue'],
  })

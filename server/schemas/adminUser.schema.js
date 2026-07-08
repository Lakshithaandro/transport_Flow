import { z } from 'zod'
import { paginationQuerySchema } from './adminQuery.schema.js'

export const adminUsersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['All', 'active', 'disabled']).optional().default('All'),
  sortBy: z.enum(['displayName', 'email', 'createdAt']).optional().default('createdAt'),
})

export const createAdminUserSchema = z.object({
  displayName: z.string().trim().min(2, 'Manager name is required').max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().default(''),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const updateAdminUserSchema = z.object({
  displayName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  status: z.enum(['active', 'disabled']).optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required')

export const resetManagerPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

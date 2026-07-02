import { z } from 'zod'
import { paginationQuerySchema } from './adminQuery.schema.js'

export const adminUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(['All', 'user', 'admin']).optional().default('All'),
  status: z.enum(['All', 'active', 'disabled']).optional().default('All'),
  sortBy: z.enum(['displayName', 'email', 'createdAt']).optional().default('createdAt'),
})

export const updateAdminUserSchema = z.object({
  displayName: z.string().trim().max(120).optional(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required')

import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().trim().max(120).optional().default(''),
})

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
})

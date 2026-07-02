import { z } from 'zod'

export const assistantQuestionSchema = z.object({
  question: z.string().trim().min(3, 'Question must be at least 3 characters.').max(1000, 'Question must be 1000 characters or less.'),
})

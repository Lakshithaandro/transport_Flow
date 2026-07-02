import rateLimit from 'express-rate-limit'

export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many admin requests. Please try again later.' },
})

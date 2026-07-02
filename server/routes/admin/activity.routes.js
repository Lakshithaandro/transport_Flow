import express from 'express'
import AdminActivity from '../../models/AdminActivity.js'
import { validateQuery } from '../../middleware/validate.js'
import { paginationQuerySchema } from '../../schemas/adminQuery.schema.js'

const router = express.Router()

router.get('/', validateQuery(paginationQuerySchema), async (req, res, next) => {
  try {
    const page = Number(req.validatedQuery.page) || 1
    const limit = Math.min(Number(req.validatedQuery.limit) || 10, 100)
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      AdminActivity.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AdminActivity.countDocuments(),
    ])

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    })
  } catch (error) {
    next(error)
  }
})

export default router

import bcrypt from 'bcryptjs'
import express from 'express'
import mongoose from 'mongoose'
import { validate, validateQuery } from '../../middleware/validate.js'
import User from '../../models/User.js'
import {
  adminUsersQuerySchema,
  createAdminUserSchema,
  resetManagerPasswordSchema,
  updateAdminUserSchema,
} from '../../schemas/adminUser.schema.js'
import { logAdminActivity } from '../../services/adminActivityService.js'

const router = express.Router()

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeRole(user) {
  if (user?.role === 'user') user.role = 'manager'
  return user
}

function sanitizeManager(user) {
  normalizeRole(user)

  return {
    id: user._id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone || '',
    role: 'manager',
    status: user.status,
    passwordResetRequired: user.passwordResetRequired || false,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function validateObjectId(id, res) {
  if (mongoose.Types.ObjectId.isValid(id)) return true
  res.status(400).json({ message: 'Invalid manager id' })
  return false
}

async function findManagerById(id) {
  const manager = await User.findOne({ _id: id, role: { $in: ['manager', 'user'] } })
  if (manager?.role === 'user') {
    manager.role = 'manager'
    await manager.save()
  }

  return manager
}

router.get('/', validateQuery(adminUsersQuerySchema), async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery
    const page = Number(queryParams.page) || 1
    const limit = Math.min(Number(queryParams.limit) || 10, 100)
    const skip = (page - 1) * limit
    const query = { role: { $in: ['manager', 'user'] } }

    if (queryParams.search) {
      const searchRegex = new RegExp(escapeRegExp(queryParams.search), 'i')
      query.$or = [{ email: searchRegex }, { displayName: searchRegex }, { phone: searchRegex }]
    }

    if (queryParams.status !== 'All') query.status = queryParams.status

    const sortFieldMap = { displayName: 'displayName', email: 'email', createdAt: 'createdAt' }
    const sortField = sortFieldMap[queryParams.sortBy] || 'createdAt'
    const sortDirection = queryParams.sortOrder === 'asc' ? 1 : -1

    const [items, total] = await Promise.all([
      User.find(query).sort({ [sortField]: sortDirection }).skip(skip).limit(limit),
      User.countDocuments(query),
    ])

    res.json({
      items: items.map(sanitizeManager),
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createAdminUserSchema), async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase()
    const existingManager = await User.findOne({ email })

    if (existingManager) {
      return res.status(409).json({ message: 'A manager account already exists for this email' })
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12)
    const manager = await User.create({
      firebaseUid: email,
      email,
      displayName: req.body.displayName,
      phone: req.body.phone || '',
      passwordHash,
      role: 'manager',
      status: 'active',
      passwordResetRequired: true,
      passwordResetAt: new Date(),
    })

    logAdminActivity(req, {
      action: 'manager_created',
      targetType: 'manager',
      targetId: manager._id,
      metadata: { email: manager.email },
    })

    return res.status(201).json(sanitizeManager(manager))
  } catch (error) {
    return next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const manager = await findManagerById(req.params.id)

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' })
    }

    return res.json(sanitizeManager(manager))
  } catch (error) {
    return next(error)
  }
})

router.patch('/:id', validate(updateAdminUserSchema), async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const manager = await findManagerById(req.params.id)

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' })
    }

    const previousStatus = manager.status

    if (req.body.displayName !== undefined) manager.displayName = req.body.displayName
    if (req.body.phone !== undefined) manager.phone = req.body.phone
    if (req.body.status !== undefined) manager.status = req.body.status
    manager.role = 'manager'

    await manager.save()

    if (previousStatus !== manager.status) {
      logAdminActivity(req, {
        action: manager.status === 'disabled' ? 'manager_disabled' : 'manager_enabled',
        targetType: 'manager',
        targetId: manager._id,
        metadata: { email: manager.email, previousStatus, status: manager.status },
      })
    } else {
      logAdminActivity(req, {
        action: 'manager_updated',
        targetType: 'manager',
        targetId: manager._id,
        metadata: { email: manager.email },
      })
    }

    return res.json(sanitizeManager(manager))
  } catch (error) {
    return next(error)
  }
})

router.post('/:id/reset-password', validate(resetManagerPasswordSchema), async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const manager = await findManagerById(req.params.id)

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' })
    }

    manager.passwordHash = await bcrypt.hash(req.body.password, 12)
    manager.passwordResetRequired = true
    manager.passwordResetAt = new Date()
    manager.role = 'manager'
    await manager.save()

    logAdminActivity(req, {
      action: 'manager_password_reset',
      targetType: 'manager',
      targetId: manager._id,
      metadata: { email: manager.email },
    })

    return res.json({ message: 'Manager password reset successfully.', manager: sanitizeManager(manager) })
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const manager = await findManagerById(req.params.id)

    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' })
    }

    await User.deleteOne({ _id: manager._id })

    logAdminActivity(req, {
      action: 'manager_deleted',
      targetType: 'manager',
      targetId: manager._id,
      metadata: { email: manager.email },
    })

    return res.json({ message: 'Manager deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router

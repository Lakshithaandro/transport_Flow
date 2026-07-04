import express from 'express'
import mongoose from 'mongoose'
import { getFirebaseAdmin } from '../../config/firebaseAdmin.js'
import { validate, validateQuery } from '../../middleware/validate.js'
import User from '../../models/User.js'
import { adminUsersQuerySchema, updateAdminUserSchema } from '../../schemas/adminUser.schema.js'
import { logAdminActivity } from '../../services/adminActivityService.js'

const router = express.Router()

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sanitizeUser(user) {
  return {
    id: user._id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function validateObjectId(id, res) {
  if (mongoose.Types.ObjectId.isValid(id)) return true
  res.status(400).json({ message: 'Invalid user id' })
  return false
}

async function assertAdminSafety(targetUser, updates, actorUserId) {
  const isTargetAdmin = targetUser.role === 'admin'
  const removesAdminRole = updates.role === 'user'
  const disablesAdmin = updates.status === 'disabled'
  const touchesAdminAccess = isTargetAdmin && (removesAdminRole || disablesAdmin)

  if (!touchesAdminAccess) return

  const activeAdminCount = await User.countDocuments({ role: 'admin', status: 'active' })
  const isSelf = targetUser._id.toString() === actorUserId

  if (activeAdminCount <= 1 || isSelf) {
    const error = new Error('Cannot remove admin access because it would risk locking out the admin panel')
    error.status = 400
    throw error
  }
}

router.get('/', validateQuery(adminUsersQuerySchema), async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery
    const page = Number(queryParams.page) || 1
    const limit = Math.min(Number(queryParams.limit) || 10, 100)
    const skip = (page - 1) * limit
    const query = {}

    if (queryParams.search) {
      const searchRegex = new RegExp(escapeRegExp(queryParams.search), 'i')
      query.$or = [{ email: searchRegex }, { displayName: searchRegex }]
    }

    if (queryParams.role !== 'All') query.role = queryParams.role
    if (queryParams.status !== 'All') query.status = queryParams.status

    const sortFieldMap = { displayName: 'displayName', email: 'email', createdAt: 'createdAt' }
    const sortField = sortFieldMap[queryParams.sortBy] || 'createdAt'
    const sortDirection = queryParams.sortOrder === 'asc' ? 1 : -1

    const [items, total] = await Promise.all([
      User.find(query).sort({ [sortField]: sortDirection }).skip(skip).limit(limit),
      User.countDocuments(query),
    ])

    res.json({
      items: items.map(sanitizeUser),
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json(sanitizeUser(user))
  } catch (error) {
    return next(error)
  }
})

router.patch('/:id', validate(updateAdminUserSchema), async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await assertAdminSafety(user, req.body, req.user.userId)

    const previousRole = user.role
    const previousStatus = user.status

    if (req.body.displayName !== undefined) user.displayName = req.body.displayName
    if (req.body.role !== undefined) user.role = req.body.role
    if (req.body.status !== undefined) user.status = req.body.status

    await user.save()

    if (req.body.status !== undefined) {
      await getFirebaseAdmin().updateUser(user.firebaseUid, { disabled: user.status === 'disabled' })
    }

    if (previousRole !== user.role) {
      logAdminActivity(req, {
        action: 'role_changed',
        targetType: 'user',
        targetId: user._id,
        metadata: { email: user.email, previousRole, role: user.role },
      })
    }

    if (previousStatus !== user.status) {
      logAdminActivity(req, {
        action: user.status === 'disabled' ? 'user_disabled' : 'user_enabled',
        targetType: 'user',
        targetId: user._id,
        metadata: { email: user.email, previousStatus, status: user.status },
      })
    }

    return res.json(sanitizeUser(user))
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await assertAdminSafety(user, { status: 'disabled' }, req.user.userId)

    user.status = 'disabled'
    await user.save()
    await getFirebaseAdmin().updateUser(user.firebaseUid, { disabled: true })

    logAdminActivity(req, {
      action: 'user_deleted',
      targetType: 'user',
      targetId: user._id,
      metadata: { email: user.email },
    })

    return res.json({ message: 'User deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router

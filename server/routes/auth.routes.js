import bcrypt from 'bcryptjs'
import express from 'express'
import { authenticateUser } from '../middleware/auth.js'
import { createAuthToken, revokeAuthToken } from '../services/authTokenService.js'
import { validate } from '../middleware/validate.js'
import User from '../models/User.js'
import { loginSchema, resetPasswordSchema } from '../schemas/auth.schema.js'
import { logAdminActivity } from '../services/adminActivityService.js'

const router = express.Router()

function getAdminEmailSet() {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

function roleForEmail(email) {
  return getAdminEmailSet().has(email.toLowerCase()) ? 'admin' : 'manager'
}

function normalizeRole(user) {
  if (user.role === 'user') user.role = 'manager'
  return user
}

function sanitizeUser(user) {
  return {
    id: user._id,
    uid: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    phone: user.phone || '',
    role: user.role,
    status: user.status,
    passwordResetRequired: user.passwordResetRequired || false,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function sendAuthResponse(res, user) {
  const token = await createAuthToken(user)
  res.json({ token, user: sanitizeUser(user) })
}

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase()
    const user = await User.findOne({ email })

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    normalizeRole(user)

    const passwordMatches = await bcrypt.compare(req.body.password, user.passwordHash)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ message: 'Account is disabled. Contact an administrator.' })
    }

    const allowedRole = roleForEmail(user.email)
    if (allowedRole === 'admin' && user.role !== 'admin') {
      user.role = 'admin'
    }

    user.lastLoginAt = new Date()
    await user.save()

    if (user.role === 'admin') {
      logAdminActivity({ user: { uid: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role } }, {
        action: 'login',
        targetType: 'account',
        targetId: user._id,
        metadata: { email: user.email, source: 'login' },
      })
    }

    return await sendAuthResponse(res, user)
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', authenticateUser, async (req, res, next) => {
  try {
    await revokeAuthToken(req.rawAuthToken)
    res.json({ message: 'Logged out' })
  } catch (error) {
    next(error)
  }
})

router.post('/reset-password', validate(resetPasswordSchema), (req, res) => {
  void req
  res.json({ message: 'Password reset email is not configured. Ask an administrator for help.' })
})

router.get('/me', authenticateUser, async (req, res, next) => {
  try {
    normalizeRole(req.appUser)
    req.appUser.lastLoginAt = new Date()
    await req.appUser.save()

    res.json(sanitizeUser(req.appUser))
  } catch (error) {
    next(error)
  }
})

export default router

import { findUserByToken } from '../services/authTokenService.js'

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ message: 'Missing auth token' })
    }

    const tokenResult = await findUserByToken(token)

    if (!tokenResult?.user) {
      return res.status(401).json({ message: 'Invalid or expired auth token' })
    }

    const appUser = tokenResult.user

    if (appUser.status === 'disabled') {
      return res.status(403).json({ message: 'User account is disabled' })
    }

    req.user = {
      uid: appUser._id.toString(),
      email: appUser.email,
      displayName: appUser.displayName,
      role: appUser.role,
      status: appUser.status,
      userId: appUser._id.toString(),
    }
    req.appUser = appUser
    req.authToken = tokenResult.authToken
    req.rawAuthToken = token

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired auth token', error: error.message })
  }
}

export function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  return next()
}

export const requireAuth = authenticateUser

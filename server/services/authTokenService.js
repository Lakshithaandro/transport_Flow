import crypto from 'node:crypto'
import AuthToken from '../models/AuthToken.js'

function getTokenExpiryDate() {
  const days = Number(process.env.AUTH_TOKEN_EXPIRES_DAYS) || 7
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}

export function hashAuthToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createAuthToken(user) {
  const token = crypto.randomBytes(48).toString('hex')
  const tokenHash = hashAuthToken(token)

  await AuthToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: getTokenExpiryDate(),
  })

  return token
}

export async function findUserByToken(token) {
  if (!token) return null

  const tokenHash = hashAuthToken(token)
  const authToken = await AuthToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).populate('userId')

  if (!authToken || !authToken.userId) return null

  authToken.lastUsedAt = new Date()
  await authToken.save()

  return { user: authToken.userId, authToken }
}

export async function revokeAuthToken(token) {
  if (!token) return

  await AuthToken.findOneAndUpdate(
    { tokenHash: hashAuthToken(token), revokedAt: null },
    { revokedAt: new Date() },
  )
}

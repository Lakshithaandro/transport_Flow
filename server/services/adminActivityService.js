import AdminActivity from '../models/AdminActivity.js'

export function logAdminActivity(req, { action, targetType, targetId = '', metadata = {} }) {
  if (!req?.user || !action || !targetType) return

  AdminActivity.create({
    adminUid: req.user.uid,
    adminEmail: req.user.email || '',
    adminName: req.user.displayName || '',
    action,
    targetType,
    targetId: targetId ? String(targetId) : '',
    metadata,
    ipAddress: req.ip || '',
    userAgent: req.get?.('user-agent') || '',
  }).catch((error) => {
    console.error('Failed to write admin activity', error)
  })
}

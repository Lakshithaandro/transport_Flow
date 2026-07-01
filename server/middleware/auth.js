import { getFirebaseAdmin } from '../config/firebaseAdmin.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ message: 'Missing Firebase auth token' })
    }

    const auth = getFirebaseAdmin()
    const decodedToken = await auth.verifyIdToken(token)

    // const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token)
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    }

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired Firebase auth token', error: error.message })
  }
}

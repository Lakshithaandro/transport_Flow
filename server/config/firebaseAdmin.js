import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  return typeof privateKey === 'string' ? privateKey.replace(/\\n/g, '\n') : ''
}

function isFirebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && getPrivateKey())
}

export function getFirebaseAdmin() {
  if (!isFirebaseAdminConfigured()) return null

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    })
  }

  return getAuth(getApp())
}

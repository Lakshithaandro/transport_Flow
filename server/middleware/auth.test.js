import { describe, expect, it, vi } from 'vitest'
import { authorizeAdmin } from './auth.js'

function mockResponse() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
  }
  return res
}

describe('authorizeAdmin', () => {
  it('returns 401 when req.user is missing', () => {
    const req = {}
    const res = mockResponse()
    const next = vi.fn()

    authorizeAdmin(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 for authenticated non-admin users', () => {
    const req = { user: { role: 'user' } }
    const res = mockResponse()
    const next = vi.fn()

    authorizeAdmin(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' })
    expect(next).not.toHaveBeenCalled()
  })

  it('allows admin users through', () => {
    const req = { user: { role: 'admin' } }
    const res = mockResponse()
    const next = vi.fn()

    authorizeAdmin(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })
})

import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { jwtAuth } from '../middlewares/jwt'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  }

  return res as unknown as Response & {
    status: jest.Mock
    json: jest.Mock
  }
}

describe('jwtAuth middleware', () => {
  it('returns 401 when Authorization header is missing', () => {
    const req = { headers: {} } as Request
    const res = createMockResponse()
    const next = jest.fn() as NextFunction

    jwtAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token manquant' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when Authorization header is malformed', () => {
    const req = {
      headers: { authorization: 'Bearer' }
    } as unknown as Request
    const res = createMockResponse()
    const next = jest.fn() as NextFunction

    jwtAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token manquant' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when token is invalid', () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token' }
    } as unknown as Request
    const res = createMockResponse()
    const next = jest.fn() as NextFunction

    jwtAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token invalide' })
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next and attaches user id when token is valid', () => {
    const token = jwt.sign({ id: 'user-123' }, JWT_SECRET)
    const req = {
      headers: { authorization: `Bearer ${token}` }
    } as unknown as Request & { user?: { id: string } }
    const res = createMockResponse()
    const next = jest.fn() as NextFunction

    jwtAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toEqual({ id: 'user-123' })
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })
})

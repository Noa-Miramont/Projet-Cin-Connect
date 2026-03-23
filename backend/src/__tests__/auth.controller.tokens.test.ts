import type { Request, Response } from 'express'
import { authController } from '../controllers/auth'
import { authService } from '../services/auth'

jest.mock('../services/auth', () => ({
  authService: {
    login: jest.fn(),
    refresh: jest.fn()
  }
}))

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

describe('authController token endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('login returns accessToken and refreshToken (nominal case)', async () => {
    const req = {
      body: { email: 'user@test.com', password: 'password123' }
    } as Request
    const res = createMockResponse()
    ;(authService.login as jest.Mock).mockResolvedValueOnce({
      user: { id: 'u1', email: 'user@test.com', username: 'user' },
      token: 'access-token',
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })

    await authController.login(req, res)

    expect(authService.login).toHaveBeenCalledWith('user@test.com', 'password123')
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
    )
  })

  it('refresh returns 400 when refreshToken is missing (edge case)', async () => {
    const req = { body: {} } as Request
    const res = createMockResponse()

    await authController.refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'refreshToken requis' })
    expect(authService.refresh).not.toHaveBeenCalled()
  })

  it('refresh returns new access token when refreshToken is valid (nominal case)', async () => {
    const req = { body: { refreshToken: 'valid-refresh' } } as Request
    const res = createMockResponse()
    ;(authService.refresh as jest.Mock).mockReturnValueOnce({
      token: 'new-access-token',
      accessToken: 'new-access-token'
    })

    await authController.refresh(req, res)

    expect(authService.refresh).toHaveBeenCalledWith('valid-refresh')
    expect(res.json).toHaveBeenCalledWith({
      token: 'new-access-token',
      accessToken: 'new-access-token'
    })
  })

  it('refresh returns 401 when refresh token is invalid (error handling)', async () => {
    const req = { body: { refreshToken: 'invalid-refresh' } } as Request
    const res = createMockResponse()
    ;(authService.refresh as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Refresh token invalide')
    })

    await authController.refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Refresh token invalide' })
  })
})

import type { Request, Response } from 'express'
import { authController } from '../controllers/auth'
import { authService } from '../services/auth'
import { AppError } from '../errors/appError'

jest.mock('../services/auth', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn()
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

describe('authController password reset endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('register returns 400 when password is missing', async () => {
    const req = {
      body: { email: 'user@test.com', username: 'user' }
    } as Request
    const res = createMockResponse()

    await authController.register(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe requis' })
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('register returns 400 when password does not respect policy', async () => {
    const req = {
      body: { email: 'user@test.com', username: 'user', password: 'weakpass' }
    } as Request
    const res = createMockResponse()
    ;(authService.register as jest.Mock).mockRejectedValueOnce(
      new AppError(
        400,
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      )
    )

    await authController.register(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    })
  })

  it('login returns 400 when email is missing', async () => {
    const req = { body: { password: 'password123' } } as Request
    const res = createMockResponse()

    await authController.login(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Email requis' })
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('login returns 401 with explicit email message', async () => {
    const req = {
      body: { email: 'unknown@test.com', password: 'password123' }
    } as Request
    const res = createMockResponse()
    ;(authService.login as jest.Mock).mockRejectedValueOnce(
      new AppError(401, 'Email incorrect')
    )

    await authController.login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Email incorrect' })
  })

  it('login returns 401 with explicit password message', async () => {
    const req = {
      body: { email: 'user@test.com', password: 'wrong-password' }
    } as Request
    const res = createMockResponse()
    ;(authService.login as jest.Mock).mockRejectedValueOnce(
      new AppError(401, 'Mot de passe incorrect')
    )

    await authController.login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe incorrect' })
  })

  it('forgotPassword returns 400 when email is missing', async () => {
    const req = { body: {} } as Request
    const res = createMockResponse()

    await authController.forgotPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Email requis' })
    expect(authService.requestPasswordReset).not.toHaveBeenCalled()
  })

  it('forgotPassword returns 200 when service succeeds', async () => {
    const req = { body: { email: 'user@test.com' } } as Request
    const res = createMockResponse()
    ;(authService.requestPasswordReset as jest.Mock).mockResolvedValueOnce(undefined)

    await authController.forgotPassword(req, res)

    expect(authService.requestPasswordReset).toHaveBeenCalledWith('user@test.com')
    expect(res.json).toHaveBeenCalledWith({ message: 'Email envoyé' })
  })

  it('forgotPassword returns 404 when email does not exist', async () => {
    const req = { body: { email: 'unknown@test.com' } } as Request
    const res = createMockResponse()
    ;(authService.requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new AppError(404, 'Aucune adresse email associée, veuillez créer votre compte.')
    )

    await authController.forgotPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Aucune adresse email associée, veuillez créer votre compte.'
    })
  })

  it('forgotPassword returns 500 with generic message when email dispatch fails', async () => {
    const req = { body: { email: 'user@test.com' } } as Request
    const res = createMockResponse()
    ;(authService.requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new Error('Échec de l’envoi de l’email de réinitialisation')
    )

    await authController.forgotPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Impossible de traiter la demande de réinitialisation.'
      })
    )
  })

  it('resetPassword returns 400 when token is missing', async () => {
    const req = { body: { password: 'newPassword123' } } as Request
    const res = createMockResponse()

    await authController.resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token requis' })
    expect(authService.resetPassword).not.toHaveBeenCalled()
  })

  it('resetPassword returns 400 when password is missing', async () => {
    const req = { body: { token: 'token-123' } } as Request
    const res = createMockResponse()

    await authController.resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Nouveau mot de passe requis' })
    expect(authService.resetPassword).not.toHaveBeenCalled()
  })

  it('resetPassword returns 200 when service succeeds', async () => {
    const req = {
      body: { token: 'token-123', password: 'newPassword123' }
    } as Request
    const res = createMockResponse()
    ;(authService.resetPassword as jest.Mock).mockResolvedValueOnce(undefined)

    await authController.resetPassword(req, res)

    expect(authService.resetPassword).toHaveBeenCalledWith('token-123', 'newPassword123')
    expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe mis à jour' })
  })

  it('resetPassword returns 400 when service rejects', async () => {
    const req = {
      body: { token: 'invalid-token', password: 'newPassword123' }
    } as Request
    const res = createMockResponse()
    ;(authService.resetPassword as jest.Mock).mockRejectedValueOnce(
      new AppError(400, 'Token invalide ou expiré')
    )

    await authController.resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Token invalide ou expiré' })
  })

  it('resetPassword returns 400 when password does not respect policy', async () => {
    const req = {
      body: { token: 'token-123', password: 'weakpass' }
    } as Request
    const res = createMockResponse()
    ;(authService.resetPassword as jest.Mock).mockRejectedValueOnce(
      new AppError(
        400,
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      )
    )

    await authController.resetPassword(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    })
  })
})

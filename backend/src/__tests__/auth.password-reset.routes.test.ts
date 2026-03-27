import request from 'supertest'
import { AppError } from '../errors/appError'

jest.mock('../services/auth', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    getProfile: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn()
  }
}))

import { createServer } from '../server'
import { authService } from '../services/auth'

const app = createServer()

describe('Auth password reset routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /api/auth/signup returns 400 when password does not respect policy', async () => {
    ;(authService.register as jest.Mock).mockRejectedValueOnce(
      new AppError(
        400,
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      )
    )

    const res = await request(app).post('/api/auth/signup').send({
      email: 'user@test.com',
      username: 'user',
      password: 'weakpass'
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      message:
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    })
  })

  it('POST /api/auth/login returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ message: 'Email requis' })
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('POST /api/auth/login returns 401 with explicit email message', async () => {
    ;(authService.login as jest.Mock).mockRejectedValueOnce(
      new AppError(401, 'Email incorrect')
    )

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@test.com', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ message: 'Email incorrect' })
  })

  it('POST /api/auth/login returns 401 with explicit password message', async () => {
    ;(authService.login as jest.Mock).mockRejectedValueOnce(
      new AppError(401, 'Mot de passe incorrect')
    )

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ message: 'Mot de passe incorrect' })
  })

  it('POST /api/auth/forgot-password returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({})

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ message: 'Email requis' })
    expect(authService.requestPasswordReset).not.toHaveBeenCalled()
  })

  it('POST /api/auth/forgot-password returns 200 when service succeeds', async () => {
    ;(authService.requestPasswordReset as jest.Mock).mockResolvedValueOnce(undefined)

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@test.com' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Email envoyé' })
    expect(authService.requestPasswordReset).toHaveBeenCalledWith('user@test.com')
  })

  it('POST /api/auth/forgot-password returns 404 when email does not exist', async () => {
    ;(authService.requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new AppError(404, 'Aucune adresse email associée, veuillez créer votre compte.')
    )

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'unknown@test.com' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      message: 'Aucune adresse email associée, veuillez créer votre compte.'
    })
  })

  it('POST /api/auth/forgot-password returns 500 when email provider fails', async () => {
    ;(authService.requestPasswordReset as jest.Mock).mockRejectedValueOnce(
      new Error('Échec de l’envoi de l’email de réinitialisation')
    )

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@test.com' })

    expect(res.status).toBe(500)
    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'Impossible de traiter la demande de réinitialisation.'
      })
    )
  })

  it('POST /api/auth/reset-password returns 400 when token is missing', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ password: 'newPassword123' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ message: 'Token requis' })
    expect(authService.resetPassword).not.toHaveBeenCalled()
  })

  it('POST /api/auth/reset-password returns 200 when service succeeds', async () => {
    ;(authService.resetPassword as jest.Mock).mockResolvedValueOnce(undefined)

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'token-123', password: 'newPassword123' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Mot de passe mis à jour' })
    expect(authService.resetPassword).toHaveBeenCalledWith('token-123', 'newPassword123')
  })

  it('POST /api/auth/reset-password returns 400 when service rejects token', async () => {
    ;(authService.resetPassword as jest.Mock).mockRejectedValueOnce(
      new AppError(400, 'Token invalide ou expiré')
    )

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'invalid-token', password: 'newPassword123' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ message: 'Token invalide ou expiré' })
  })

  it('POST /api/auth/reset-password returns 400 when password does not respect policy', async () => {
    ;(authService.resetPassword as jest.Mock).mockRejectedValueOnce(
      new AppError(
        400,
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      )
    )

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'token-123', password: 'weakpass' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      message:
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    })
  })
})

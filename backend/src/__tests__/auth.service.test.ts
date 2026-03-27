import bcrypt from 'bcrypt'
import { AppError } from '../errors/appError'

jest.mock('../repositories/user', () => ({
  userRepository: {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    searchByUsername: jest.fn(),
    updatePassword: jest.fn()
  }
}))

jest.mock('../repositories/passwordResetToken', () => ({
  passwordResetTokenRepository: {
    create: jest.fn(),
    findActiveByTokenHash: jest.fn(),
    invalidateActiveForUser: jest.fn(),
    markUsed: jest.fn()
  }
}))

jest.mock('../services/email', () => ({
  emailService: {
    sendResetEmail: jest.fn()
  }
}))

import { authService } from '../services/auth'
import { userRepository } from '../repositories/user'
import { passwordResetTokenRepository } from '../repositories/passwordResetToken'
import { emailService } from '../services/email'

const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>
const mockedPasswordResetTokenRepository =
  passwordResetTokenRepository as jest.Mocked<typeof passwordResetTokenRepository>
const mockedEmailService = emailService as jest.Mocked<typeof emailService>

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('register rejects a weak password', async () => {
    await expect(
      authService.register({
        email: 'user@test.com',
        username: 'user',
        password: 'weakpass'
      })
    ).rejects.toMatchObject({
      status: 400,
      message:
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    })

    expect(mockedUserRepository.findByEmail).not.toHaveBeenCalled()
    expect(mockedUserRepository.create).not.toHaveBeenCalled()
  })

  it('register normalizes input, hashes password and returns tokens', async () => {
    const createdUser = {
      id: 'user-1',
      email: 'user@test.com',
      username: 'Maduzan',
      password: 'hashed-password',
      created_at: new Date('2026-03-26T10:00:00.000Z')
    }

    mockedUserRepository.findByEmail.mockResolvedValueOnce(undefined as never)
    mockedUserRepository.findByUsername.mockResolvedValueOnce(undefined as never)
    mockedUserRepository.create.mockResolvedValueOnce(createdUser)
    jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashed-password' as never)

    const result = await authService.register({
      email: ' USER@Test.com ',
      username: '  Maduzan ',
      password: 'Password123!'
    })

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith('user@test.com')
    expect(mockedUserRepository.findByUsername).toHaveBeenCalledWith('Maduzan')
    expect(mockedUserRepository.create).toHaveBeenCalledWith({
      email: 'user@test.com',
      username: 'Maduzan',
      password: 'hashed-password'
    })
    expect(result.user).toMatchObject({
      id: 'user-1',
      email: 'user@test.com',
      username: 'Maduzan'
    })
    expect(result.accessToken).toEqual(expect.any(String))
    expect(result.refreshToken).toEqual(expect.any(String))
    expect(result.token).toBe(result.accessToken)
  })

  it('login rejects an unknown email', async () => {
    mockedUserRepository.findByEmail.mockResolvedValueOnce(undefined as never)

    await expect(authService.login('missing@test.com', 'Password123!')).rejects.toMatchObject({
      status: 401,
      message: 'Email incorrect'
    })
  })

  it('login rejects an invalid password', async () => {
    mockedUserRepository.findByEmail.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@test.com',
      username: 'user',
      password: 'hashed-password',
      created_at: new Date('2026-03-26T10:00:00.000Z')
    })
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never)

    await expect(authService.login('user@test.com', 'WrongPassword123!')).rejects.toMatchObject(
      {
      status: 401,
      message: 'Mot de passe incorrect'
      }
    )
  })

  it('login returns tokens for valid credentials', async () => {
    mockedUserRepository.findByEmail.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@test.com',
      username: 'user',
      password: 'hashed-password',
      created_at: new Date('2026-03-26T10:00:00.000Z')
    })
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never)

    const result = await authService.login(' user@test.com ', 'Password123!')

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith('user@test.com')
    expect(result.user.email).toBe('user@test.com')
    expect(result.accessToken).toEqual(expect.any(String))
    expect(result.refreshToken).toEqual(expect.any(String))
  })

  it('requestPasswordReset rejects an unknown email', async () => {
    mockedUserRepository.findByEmail.mockResolvedValueOnce(undefined as never)

    await expect(authService.requestPasswordReset('missing@test.com')).rejects.toMatchObject({
      status: 404,
      message: 'Aucune adresse email associée, veuillez créer votre compte.'
    })

    expect(mockedPasswordResetTokenRepository.create).not.toHaveBeenCalled()
    expect(mockedEmailService.sendResetEmail).not.toHaveBeenCalled()
  })

  it('requestPasswordReset stores a token and dispatches an email', async () => {
    mockedUserRepository.findByEmail.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@test.com',
      username: 'user',
      password: 'hashed-password',
      created_at: new Date('2026-03-26T10:00:00.000Z')
    })
    mockedPasswordResetTokenRepository.invalidateActiveForUser.mockResolvedValueOnce(undefined)
    mockedPasswordResetTokenRepository.create.mockResolvedValueOnce({
      id: 'prt-1'
    } as never)
    mockedEmailService.sendResetEmail.mockResolvedValueOnce({
      provider: 'mailgun',
      id: 'message-1'
    })

    await authService.requestPasswordReset('user@test.com')

    expect(mockedPasswordResetTokenRepository.invalidateActiveForUser).toHaveBeenCalledWith(
      'user-1'
    )
    expect(mockedPasswordResetTokenRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      tokenHash: expect.any(String),
      expiresAt: expect.any(Date)
    })
    expect(mockedEmailService.sendResetEmail).toHaveBeenCalledWith({
      to: 'user@test.com',
      username: 'user',
      resetLink: expect.stringContaining('token=')
    })
  })

  it('requestPasswordReset wraps email provider failures', async () => {
    mockedUserRepository.findByEmail.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@test.com',
      username: 'user',
      password: 'hashed-password',
      created_at: new Date('2026-03-26T10:00:00.000Z')
    })
    mockedPasswordResetTokenRepository.invalidateActiveForUser.mockResolvedValueOnce(undefined)
    mockedPasswordResetTokenRepository.create.mockResolvedValueOnce({
      id: 'prt-1'
    } as never)
    mockedEmailService.sendResetEmail.mockRejectedValueOnce(new Error('Mailgun failed'))

    await expect(authService.requestPasswordReset('user@test.com')).rejects.toMatchObject({
      status: 500,
      message: 'Impossible de traiter la demande de réinitialisation.'
    })
  })

  it('resetPassword rejects a weak password', async () => {
    await expect(
      authService.resetPassword('token-123', 'weakpass')
    ).rejects.toMatchObject({
      status: 400,
      message:
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
    })

    expect(mockedPasswordResetTokenRepository.findActiveByTokenHash).not.toHaveBeenCalled()
  })

  it('resetPassword rejects an invalid token', async () => {
    mockedPasswordResetTokenRepository.findActiveByTokenHash.mockResolvedValueOnce(
      undefined as never
    )

    await expect(
      authService.resetPassword('token-123', 'Password123!')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Token invalide ou expiré'
    })
  })

  it('resetPassword hashes and updates the password when token is valid', async () => {
    mockedPasswordResetTokenRepository.findActiveByTokenHash.mockResolvedValueOnce({
      id: 'prt-1',
      user_id: 'user-1'
    } as never)
    jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('new-hash' as never)
    mockedUserRepository.updatePassword.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@test.com',
      username: 'user',
      password: 'new-hash',
      created_at: new Date('2026-03-26T10:00:00.000Z')
    })
    mockedPasswordResetTokenRepository.markUsed.mockResolvedValueOnce(undefined)
    mockedPasswordResetTokenRepository.invalidateActiveForUser.mockResolvedValueOnce(undefined)

    await authService.resetPassword('token-123', 'Password123!')

    expect(mockedPasswordResetTokenRepository.findActiveByTokenHash).toHaveBeenCalledWith(
      expect.any(String)
    )
    expect(mockedUserRepository.updatePassword).toHaveBeenCalledWith('user-1', 'new-hash')
    expect(mockedPasswordResetTokenRepository.markUsed).toHaveBeenCalledWith('prt-1')
    expect(mockedPasswordResetTokenRepository.invalidateActiveForUser).toHaveBeenCalledWith(
      'user-1'
    )
  })
})

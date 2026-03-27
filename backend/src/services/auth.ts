import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { createHash, randomBytes } from 'crypto'
import { userRepository } from '../repositories/user'
import { passwordResetTokenRepository } from '../repositories/passwordResetToken'
import { emailService } from './email'
import { AppError } from '../errors/appError'
import { getPasswordPolicyMessage, isStrongPassword } from '../utils/password'

const jwtSecret = process.env.JWT_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

if (!jwtSecret) {
  throw new Error('JWT_SECRET manquant dans le fichier .env')
}

if (!refreshTokenSecret) {
  throw new Error('REFRESH_TOKEN_SECRET manquant dans le fichier .env')
}

const JWT_SECRET: string = jwtSecret
const REFRESH_TOKEN_SECRET: string = refreshTokenSecret
const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ??
  '15m') as SignOptions['expiresIn']
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ??
  '7d') as SignOptions['expiresIn']
const SALT_ROUNDS = 10
const PASSWORD_RESET_TOKEN_TTL_MINUTES = Number.isFinite(
  Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES)
)
  ? Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES)
  : 60
const PASSWORD_RESET_URL_BASE =
  process.env.PASSWORD_RESET_URL_BASE ?? 'http://localhost:3000/reset-password'
const SHOULD_LOG_FULL_RESET_LINK = process.env.NODE_ENV !== 'production'

function toPublic(user: { id: string; email: string; username: string; created_at: Date }) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.created_at
  }
}

function signAccessToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  })
}

function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId, type: 'refresh' }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  })
}

function generateResetToken() {
  return randomBytes(32).toString('hex')
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function buildResetLink(token: string) {
  try {
    const url = new URL(PASSWORD_RESET_URL_BASE)
    url.searchParams.set('token', token)
    return url.toString()
  } catch {
    const separator = PASSWORD_RESET_URL_BASE.includes('?') ? '&' : '?'
    return `${PASSWORD_RESET_URL_BASE}${separator}token=${encodeURIComponent(token)}`
  }
}

export const authService = {
  async register(payload: { email: string; username: string; password: string }) {
    const cleanEmail = payload.email.trim().toLowerCase()
    const cleanUsername = payload.username.trim()

    if (!cleanEmail) {
      throw new AppError(400, 'Email requis')
    }

    if (!cleanUsername) {
      throw new AppError(400, 'Pseudo requis')
    }

    if (!payload.password) {
      throw new AppError(400, 'Mot de passe requis')
    }

    if (!isStrongPassword(payload.password)) {
      console.warn('[AUTH] register rejected: weak password', {
        email: cleanEmail,
        username: cleanUsername
      })
      throw new AppError(400, getPasswordPolicyMessage())
    }

    const existing = await userRepository.findByEmail(cleanEmail)
    if (existing) throw new Error('Cet email est déjà utilisé')
    const byUsername = await userRepository.findByUsername(cleanUsername)
    if (byUsername) throw new Error('Ce pseudo est déjà pris')
    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
    const user = await userRepository.create({
      email: cleanEmail,
      username: cleanUsername,
      password: passwordHash
    })
    if (!user) throw new Error('Erreur lors de la création du compte')
    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)
    return { user: toPublic(user), token: accessToken, accessToken, refreshToken }
  },

  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      throw new AppError(400, 'Email requis')
    }
    if (!password) {
      throw new AppError(400, 'Mot de passe requis')
    }

    const user = await userRepository.findByEmail(cleanEmail)
    if (!user) {
      console.warn('[AUTH] login failed: unknown email', { email: cleanEmail })
      throw new AppError(401, 'Email incorrect')
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      console.warn('[AUTH] login failed: invalid password', {
        userId: user.id,
        email: cleanEmail
      })
      throw new AppError(401, 'Mot de passe incorrect')
    }

    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)
    return { user: toPublic(user), token: accessToken, accessToken, refreshToken }
  },

  refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id?: string
        type?: string
      }
      if (!payload?.id || payload.type !== 'refresh') {
        throw new Error('Refresh token invalide')
      }
      const accessToken = signAccessToken(payload.id)
      return { token: accessToken, accessToken }
    } catch {
      throw new Error('Refresh token invalide')
    }
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')
    return toPublic(user)
  },

  async requestPasswordReset(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      throw new AppError(400, 'Email requis')
    }

    const user = await userRepository.findByEmail(cleanEmail)
    if (!user) {
      console.warn('[AUTH] forgot-password failed: unknown email', {
        email: cleanEmail
      })
      throw new AppError(
        404,
        'Aucune adresse email associée, veuillez créer votre compte.'
      )
    }

    const rawToken = generateResetToken()
    const tokenHash = hashResetToken(rawToken)
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000)

    await passwordResetTokenRepository.invalidateActiveForUser(user.id)
    await passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt
    })

    const resetLink = buildResetLink(rawToken)
    console.log('[AUTH] reset token generated', {
      userId: user.id,
      tokenPreview: `${rawToken.slice(0, 8)}...`,
      expiresAt: expiresAt.toISOString()
    })
    console.log(
      '[AUTH] reset link generated',
      SHOULD_LOG_FULL_RESET_LINK
        ? {
            userId: user.id,
            email: user.email,
            resetLink
          }
        : {
            userId: user.id,
            email: user.email,
            resetBaseUrl: PASSWORD_RESET_URL_BASE
          }
    )

    let emailResult
    try {
      emailResult = await emailService.sendResetEmail({
        to: user.email,
        username: user.username,
        resetLink
      })
    } catch (error) {
      console.error('[AUTH] forgot-password email dispatch failed', {
        userId: user.id,
        email: user.email,
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      })
      throw new AppError(
        500,
        'Impossible de traiter la demande de réinitialisation.'
      )
    }

    console.log('[AUTH] reset email dispatch result', {
      userId: user.id,
      email: user.email,
      provider: emailResult.provider,
      id: emailResult.id
    })
  },

  async resetPassword(token: string, newPassword: string) {
    const cleanToken = token.trim()
    if (!cleanToken) {
      throw new AppError(400, 'Token invalide ou expiré')
    }
    if (!newPassword) {
      throw new AppError(400, 'Nouveau mot de passe requis')
    }
    if (!isStrongPassword(newPassword)) {
      console.warn('[AUTH] reset-password rejected: weak password')
      throw new AppError(400, getPasswordPolicyMessage())
    }

    const tokenHash = hashResetToken(cleanToken)
    const resetToken = await passwordResetTokenRepository.findActiveByTokenHash(tokenHash)
    if (!resetToken) {
      throw new AppError(400, 'Token invalide ou expiré')
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    const updatedUser = await userRepository.updatePassword(resetToken.user_id, passwordHash)
    if (!updatedUser) {
      throw new AppError(404, 'Utilisateur non trouvé')
    }

    await passwordResetTokenRepository.markUsed(resetToken.id)
    await passwordResetTokenRepository.invalidateActiveForUser(resetToken.user_id)
  }
}

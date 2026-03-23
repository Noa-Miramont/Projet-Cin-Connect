import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { userRepository } from '../repositories/user'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? 'dev-refresh-secret-change-in-production'
const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ??
  '15m') as SignOptions['expiresIn']
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ??
  '7d') as SignOptions['expiresIn']
const SALT_ROUNDS = 10

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

export const authService = {
  async register(payload: { email: string; username: string; password: string }) {
    const existing = await userRepository.findByEmail(payload.email)
    if (existing) throw new Error('Cet email est déjà utilisé')
    const byUsername = await userRepository.findByUsername(payload.username)
    if (byUsername) throw new Error('Ce pseudo est déjà pris')
    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
    const user = await userRepository.create({
      email: payload.email,
      username: payload.username,
      password: passwordHash
    })
    if (!user) throw new Error('Erreur lors de la création du compte')
    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)
    return { user: toPublic(user), token: accessToken, accessToken, refreshToken }
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) throw new Error('Email ou mot de passe incorrect')
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new Error('Email ou mot de passe incorrect')
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
  }
}

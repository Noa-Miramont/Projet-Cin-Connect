import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { UserPublic } from '@cineconnect/shared'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const SALT_ROUNDS = 10

export const authService = {
  async register(payload: { email: string; username: string; password: string }) {
    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
    const user: UserPublic = {
      id: crypto.randomUUID(),
      email: payload.email,
      username: payload.username,
      createdAt: new Date()
    }
    return { user, token: jwt.sign({ id: user.id }, JWT_SECRET) }
  },

  async login(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user: UserPublic = {
      id: crypto.randomUUID(),
      email,
      username: email.split('@')[0],
      createdAt: new Date()
    }
    return { user, token: jwt.sign({ id: user.id }, JWT_SECRET) }
  },

  async getProfile(userId: string): Promise<UserPublic> {
    return {
      id: userId,
      email: 'user@example.com',
      username: 'user',
      createdAt: new Date()
    }
  }
}

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { userRepository } from '../repositories/user'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const SALT_ROUNDS = 10

function toPublic(user: { id: string; email: string; username: string; created_at: Date }) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.created_at
  }
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
    const token = jwt.sign({ id: user.id }, JWT_SECRET)
    return { user: toPublic(user), token }
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) throw new Error('Email ou mot de passe incorrect')
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new Error('Email ou mot de passe incorrect')
    const token = jwt.sign({ id: user.id }, JWT_SECRET)
    return { user: toPublic(user), token }
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error('Utilisateur non trouvé')
    return toPublic(user)
  }
}

import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createServer } from '../server'

const app = createServer()
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? 'dev-refresh-secret-change-in-production'

describe('Auth routes', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'Password123!' })
      expect(res.status).toBe(400)
    })

    it('should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'Password123!' })
      expect(res.status).toBe(400)
    })

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', username: 'test' })
      expect(res.status).toBe(400)
    })

    it('should return 400 when password is too weak', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'weak@test.com', username: 'weakuser', password: 'password' })
      expect(res.status).toBe(400)
      expect(res.body).toEqual({
        message:
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      })
    })

    it('should return 201 and user + token when valid', async () => {
      const email = `user-${Date.now()}@test.com`
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email, username: `user${Date.now()}`, password: 'Password123!' })
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('user')
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('id')
      expect(res.body.user).toHaveProperty('email', email)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should return 401 with explicit email message when email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' })
      expect(res.status).toBe(401)
      expect(res.body).toEqual({ message: 'Email incorrect' })
    })

    it('should return 400 with explicit message when body is incomplete', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' })
      expect(res.status).toBe(400)
      expect(res.body).toEqual({ message: 'Mot de passe requis' })
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should return 400 when refreshToken is missing', async () => {
      const res = await request(app).post('/api/auth/refresh').send({})
      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'refreshToken requis' })
    })

    it('should return 401 when refreshToken is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid' })
      expect(res.status).toBe(401)
      expect(res.body).toEqual({ error: 'Refresh token invalide' })
    })

    it('should return accessToken when refreshToken is valid', async () => {
      const refreshToken = jwt.sign(
        { id: 'user-id-1', type: 'refresh' },
        REFRESH_TOKEN_SECRET
      )
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('token')
    })
  })
})

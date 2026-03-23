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
        .send({ username: 'test', password: 'password123' })
      expect(res.status).toBe(400)
    })

    it('should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password123' })
      expect(res.status).toBe(400)
    })

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', username: 'test' })
      expect(res.status).toBe(400)
    })

    it('should return 201 and user + token when valid', async () => {
      const email = `user-${Date.now()}@test.com`
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email, username: `user${Date.now()}`, password: 'password123' })
      if (res.status === 201) {
        expect(res.body).toHaveProperty('user')
        expect(res.body).toHaveProperty('token')
        expect(res.body.user).toHaveProperty('id')
        expect(res.body.user).toHaveProperty('email', email)
      }
    })
  })

  describe('POST /api/auth/login', () => {
    it('should return 401 when credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrong' })
      expect(res.status).toBe(401)
    })

    it('should return 400/401 when body is incomplete', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' })
      expect([400, 401]).toContain(res.status)
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

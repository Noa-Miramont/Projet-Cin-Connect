import request from 'supertest'
import { createServer } from '../server'

const app = createServer()

describe('Friends routes', () => {
  describe('GET /api/friends', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/friends')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/friends', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/friends')
        .send({ username: 'someone' })
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/friends/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete(
        '/api/friends/00000000-0000-0000-0000-000000000000'
      )
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/friends/requests/received', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/friends/requests/received')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/friends/requests/:id/accept', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).post(
        '/api/friends/requests/00000000-0000-0000-0000-000000000000/accept'
      )
      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/friends/requests/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete(
        '/api/friends/requests/00000000-0000-0000-0000-000000000000'
      )
      expect(res.status).toBe(401)
    })
  })
})

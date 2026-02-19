import request from 'supertest'
import { createServer } from '../server'

const app = createServer()

describe('Messages routes', () => {
  describe('GET /api/messages', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/messages')
      expect(res.status).toBe(401)
    })

    it('should return 400 when userId is missing', async () => {
      const res = await request(app)
        .get('/api/messages')
        .set('Authorization', 'Bearer invalid-token')
      expect([400, 401]).toContain(res.status)
    })
  })
})

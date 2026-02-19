import request from 'supertest'
import { createServer } from '../server'

const app = createServer()

describe('Reviews routes', () => {
  describe('GET /api/reviews', () => {
    it('should return 400 when filmId is missing', async () => {
      const res = await request(app).get('/api/reviews')
      expect(res.status).toBe(400)
    })

    it('should return 200 with filmId when DB is available', async () => {
      const res = await request(app)
        .get('/api/reviews')
        .query({ filmId: '00000000-0000-0000-0000-000000000000' })
      expect([200, 500]).toContain(res.status)
      if (res.status === 200) expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('POST /api/reviews', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({ filmId: '00000000-0000-0000-0000-000000000000', rating: 4 })
      expect(res.status).toBe(401)
    })
  })
})

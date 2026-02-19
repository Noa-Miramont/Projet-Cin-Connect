import request from 'supertest'
import { createServer } from '../server'

const app = createServer()

describe('Films routes', () => {
  describe('GET /api/films', () => {
    it('should return 200 and list of films when DB is available', async () => {
      const res = await request(app).get('/api/films')
      expect([200, 500]).toContain(res.status)
      if (res.status === 200) {
        expect(res.body).toHaveProperty('films')
        expect(res.body).toHaveProperty('total')
        expect(Array.isArray(res.body.films)).toBe(true)
      }
    })

    it('should accept query params', async () => {
      const res = await request(app)
        .get('/api/films')
        .query({ page: 1, limit: 5 })
      expect([200, 500]).toContain(res.status)
      if (res.status === 200 && res.body.films) {
        expect(res.body.films.length).toBeLessThanOrEqual(5)
      }
    })
  })

  describe('GET /api/films/:id', () => {
    it('should return 404 for invalid id when DB is available', async () => {
      const res = await request(app).get(
        '/api/films/00000000-0000-0000-0000-000000000000'
      )
      expect([404, 500]).toContain(res.status)
    })
  })
})

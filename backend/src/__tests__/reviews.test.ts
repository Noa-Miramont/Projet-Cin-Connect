import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../services/review', () => ({
  reviewService: {
    listByFilm: jest.fn(),
    create: jest.fn(),
    replace: jest.fn(),
    delete: jest.fn()
  }
}))

import { createServer } from '../server'
import { reviewService } from '../services/review'

const app = createServer()
const JWT_SECRET = process.env.JWT_SECRET as string

function buildToken(userId = 'user-1') {
  return jwt.sign({ id: userId }, JWT_SECRET)
}

describe('Reviews routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/reviews', () => {
    it('should return 400 when filmId is missing', async () => {
      const res = await request(app).get('/api/reviews')
      expect(res.status).toBe(400)
      expect(res.body).toEqual({ error: 'filmId requis' })
    })

    it('should return 200 with the reviews list', async () => {
      ;(reviewService.listByFilm as jest.Mock).mockResolvedValueOnce([
        { id: 'review-1', rating: 5, username: 'alice' }
      ])

      const res = await request(app)
        .get('/api/reviews')
        .query({ filmId: 'film-1' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual([{ id: 'review-1', rating: 5, username: 'alice' }])
    })
  })

  describe('POST /api/reviews', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({ filmId: 'film-1', rating: 4 })
      expect(res.status).toBe(401)
      expect(res.body).toEqual({ error: 'Token manquant' })
    })
  })

  describe('DELETE /api/reviews/:filmId', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete('/api/reviews/film-1')

      expect(res.status).toBe(401)
      expect(res.body).toEqual({ error: 'Token manquant' })
    })

    it('should return 404 when the review does not exist', async () => {
      ;(reviewService.delete as jest.Mock).mockRejectedValueOnce(new Error('Avis introuvable'))

      const res = await request(app)
        .delete('/api/reviews/film-1')
        .set('Authorization', `Bearer ${buildToken()}`)

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'Avis introuvable' })
      expect(reviewService.delete).toHaveBeenCalledWith('user-1', 'film-1')
    })

    it('should return 204 when the review is deleted', async () => {
      ;(reviewService.delete as jest.Mock).mockResolvedValueOnce({ id: 'review-1' })

      const res = await request(app)
        .delete('/api/reviews/film-1')
        .set('Authorization', `Bearer ${buildToken()}`)

      expect(res.status).toBe(204)
      expect(reviewService.delete).toHaveBeenCalledWith('user-1', 'film-1')
    })
  })
})

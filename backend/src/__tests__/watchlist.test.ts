import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../services/watchlist', () => ({
  watchlistService: {
    listByUser: jest.fn(),
    add: jest.fn(),
    remove: jest.fn()
  }
}))

import { createServer } from '../server'
import { watchlistService } from '../services/watchlist'

const app = createServer()
const JWT_SECRET = process.env.JWT_SECRET as string

function buildToken(userId = 'user-1') {
  return jwt.sign({ id: userId }, JWT_SECRET)
}

describe('Watchlist routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 on GET when not authenticated', async () => {
    const res = await request(app).get('/api/watchlist')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Token manquant' })
  })

  it('should return the authenticated user watchlist', async () => {
    ;(watchlistService.listByUser as jest.Mock).mockResolvedValueOnce([
      {
        id: 'film-1',
        title: 'Inception',
        posterUrl: '/poster.jpg',
        addedAt: '2026-03-30T10:00:00.000Z'
      }
    ])

    const res = await request(app)
      .get('/api/watchlist')
      .set('Authorization', `Bearer ${buildToken()}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(watchlistService.listByUser).toHaveBeenCalledWith('user-1')
  })

  it('should return 400 when filmId is missing on POST', async () => {
    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'filmId requis' })
  })

  it('should return 404 when the film does not exist on POST', async () => {
    ;(watchlistService.add as jest.Mock).mockRejectedValueOnce(new Error('Film introuvable'))

    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ filmId: 'film-404' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Film introuvable' })
  })

  it('should return 409 when the film is already in watchlist on POST', async () => {
    ;(watchlistService.add as jest.Mock).mockRejectedValueOnce(
      new Error('Film déjà présent dans la watchlist')
    )

    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ filmId: 'film-1' })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({ error: 'Film déjà présent dans la watchlist' })
  })

  it('should add a film to watchlist on POST', async () => {
    ;(watchlistService.add as jest.Mock).mockResolvedValueOnce({
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg',
      addedAt: '2026-03-30T10:00:00.000Z'
    })

    const res = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${buildToken()}`)
      .send({ filmId: 'film-1' })

    expect(res.status).toBe(201)
    expect(watchlistService.add).toHaveBeenCalledWith('user-1', 'film-1')
  })

  it('should return 404 when the film is absent on DELETE', async () => {
    ;(watchlistService.remove as jest.Mock).mockRejectedValueOnce(
      new Error('Film absent de la watchlist')
    )

    const res = await request(app)
      .delete('/api/watchlist/film-1')
      .set('Authorization', `Bearer ${buildToken()}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Film absent de la watchlist' })
  })

  it('should delete a film from watchlist on DELETE', async () => {
    ;(watchlistService.remove as jest.Mock).mockResolvedValueOnce({ filmId: 'film-1' })

    const res = await request(app)
      .delete('/api/watchlist/film-1')
      .set('Authorization', `Bearer ${buildToken()}`)

    expect(res.status).toBe(204)
    expect(watchlistService.remove).toHaveBeenCalledWith('user-1', 'film-1')
  })
})

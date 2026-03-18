import { Request, Response } from 'express'
import { reviewService } from '../services/review'

type AuthRequest = Request & { user?: { id: string } }

export const reviewController = {
  async create(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const { filmId, rating, comment } = req.body
      if (!filmId || rating == null) {
        return res.status(400).json({ error: 'filmId et rating requis' })
      }
      const review = await reviewService.create(user.id, {
        filmId,
        rating: Number(rating),
        comment
      })
      res.status(201).json(review)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('déjà noté')) return res.status(409).json({ error: msg })
      if (msg.includes('entre 1 et 5')) return res.status(400).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  },

  async replace(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })

    try {
      const filmId = req.params.filmId
      const { rating, comment } = req.body
      if (!filmId || rating == null) {
        return res.status(400).json({ error: 'filmId et rating requis' })
      }

      const review = await reviewService.replace(user.id, {
        filmId,
        rating: Number(rating),
        comment
      })

      res.status(200).json(review)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('entre 1 et 5')) return res.status(400).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  },

  async list(req: Request, res: Response) {
    try {
      const filmId = req.query.filmId as string
      if (!filmId) {
        return res.status(400).json({ error: 'filmId requis' })
      }
      const reviews = await reviewService.listByFilm(filmId)
      res.json(reviews)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  }
}

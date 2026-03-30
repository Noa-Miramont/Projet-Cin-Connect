import { Request, Response } from 'express'
import { watchlistService } from '../services/watchlist'

type AuthRequest = Request & { user?: { id: string } }

export const watchlistController = {
  async list(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })

    try {
      const watchlist = await watchlistService.listByUser(user.id)
      res.status(200).json(watchlist)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async add(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })

    try {
      const { filmId } = req.body
      if (!filmId) {
        return res.status(400).json({ error: 'filmId requis' })
      }

      const item = await watchlistService.add(user.id, filmId)
      res.status(201).json(item)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('introuvable')) return res.status(404).json({ error: msg })
      if (msg.includes('déjà présent')) return res.status(409).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  },

  async delete(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })

    try {
      const filmId = req.params.filmId
      if (!filmId) {
        return res.status(400).json({ error: 'filmId requis' })
      }

      await watchlistService.remove(user.id, filmId)
      res.status(204).send()
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('absent')) return res.status(404).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  }
}

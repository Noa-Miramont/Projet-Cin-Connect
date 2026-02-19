import { Request, Response } from 'express'
import { userService } from '../services/user'

type AuthRequest = Request & { user?: { id: string } }

export const userController = {
  async me(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const profile = await userService.getMe(user.id)
      res.json(profile)
    } catch (err) {
      res.status(404).json({ error: (err as Error).message })
    }
  },

  async myReviews(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const reviews = await userService.getMyReviews(user.id)
      res.json(reviews)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async search(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const q = (req.query.q as string) ?? ''
      const limit = req.query.limit ? Number(req.query.limit) : 10
      const users = await userService.searchByUsername(q, limit)
      res.json(users)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  }
}

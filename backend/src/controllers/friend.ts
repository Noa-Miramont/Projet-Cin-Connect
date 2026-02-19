import { Request, Response } from 'express'
import { friendService } from '../services/friend'

type AuthRequest = Request & { user?: { id: string } }

export const friendController = {
  async list(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const friends = await friendService.list(user.id)
      res.json(friends)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async add(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const { username } = req.body
      if (!username?.trim()) {
        return res.status(400).json({ error: 'username requis' })
      }
      const result = await friendService.add(user.id, username.trim())
      res.status(201).json(result)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('non trouvé')) return res.status(404).json({ error: msg })
      if (msg.includes('Déjà ami')) return res.status(409).json({ error: msg })
      if (msg.includes('vous-même')) return res.status(400).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  },

  async remove(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const { id } = req.params
      await friendService.remove(user.id, id)
      res.status(204).send()
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('non trouvé')) return res.status(404).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  }
}

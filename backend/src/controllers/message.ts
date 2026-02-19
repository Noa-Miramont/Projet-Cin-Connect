import { Request, Response } from 'express'
import { messageService } from '../services/message'

type AuthRequest = Request & { user?: { id: string } }

export const messageController = {
  async list(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const userId = req.query.userId as string
      if (!userId) {
        return res.status(400).json({ error: 'userId requis' })
      }
      const limit = req.query.limit ? Number(req.query.limit) : 50
      const messages = await messageService.getConversation(user.id, userId, limit)
      res.json(messages)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('amis')) return res.status(403).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  }
}

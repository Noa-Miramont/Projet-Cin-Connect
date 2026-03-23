import { Request, Response } from 'express'
import { authService } from '../services/auth'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body
      const user = await authService.register({ email, username, password })
      res.status(201).json(user)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      res.json(result)
    } catch (err) {
      res.status(401).json({ error: (err as Error).message })
    }
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken?: string }
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken requis' })
    }
    try {
      const result = authService.refresh(refreshToken)
      res.json(result)
    } catch (err) {
      res.status(401).json({ error: (err as Error).message })
    }
  },

  async me(req: Request, res: Response) {
    const user = (req as Request & { user?: { id: string } }).user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const profile = await authService.getProfile(user.id)
      res.json(profile)
    } catch (err) {
      res.status(404).json({ error: (err as Error).message })
    }
  }
}

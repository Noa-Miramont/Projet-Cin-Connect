import { Request, Response } from 'express'
import { authService } from '../services/auth'
import { isAppError } from '../errors/appError'

export const authController = {
  async register(req: Request, res: Response) {
    const { email, username, password } = req.body as {
      email?: string
      username?: string
      password?: string
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email requis' })
    }
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Pseudo requis' })
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Mot de passe requis' })
    }

    try {
      const user = await authService.register({ email, username, password })
      return res.status(201).json(user)
    } catch (err) {
      if (isAppError(err)) {
        console.warn('[AUTH] register rejected', {
          status: err.status,
          message: err.message
        })
        return res.status(err.status).json({ message: err.message })
      }

      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.warn('[AUTH] register failed', { message })
      return res.status(400).json({ message })
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email requis' })
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Mot de passe requis' })
    }

    try {
      const result = await authService.login(email, password)
      res.json(result)
    } catch (err) {
      if (isAppError(err)) {
        console.warn('[AUTH] login rejected', {
          status: err.status,
          message: err.message
        })
        return res.status(err.status).json({ message: err.message })
      }

      console.error('[AUTH] login failed', {
        message: err instanceof Error ? err.message : 'Erreur inconnue'
      })
      return res.status(500).json({ message: 'Erreur interne du serveur' })
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
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body as { email?: string }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email requis' })
    }
    try {
      await authService.requestPasswordReset(email)
      return res.json({ message: 'Email envoyé' })
    } catch (err) {
      if (isAppError(err)) {
        const logMethod = err.status >= 500 ? console.error : console.warn
        logMethod('[AUTH] forgotPassword failed', {
          status: err.status,
          message: err.message
        })
        return res.status(err.status).json({ message: err.message })
      }

      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('[AUTH] forgotPassword failed', { message })
      return res.status(500).json({
        message: 'Impossible de traiter la demande de réinitialisation.',
        ...(process.env.NODE_ENV !== 'production' ? { details: message } : {})
      })
    }
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body as { token?: string; password?: string }
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token requis' })
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Nouveau mot de passe requis' })
    }

    try {
      await authService.resetPassword(token, password)
      return res.json({ message: 'Mot de passe mis à jour' })
    } catch (err) {
      if (isAppError(err)) {
        const logMethod = err.status >= 500 ? console.error : console.warn
        logMethod('[AUTH] resetPassword failed', {
          status: err.status,
          message: err.message
        })
        return res.status(err.status).json({ message: err.message })
      }

      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('[AUTH] resetPassword failed', { message })
      return res.status(400).json({ message })
    }
  }
}

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error('JWT_SECRET manquant dans le fichier .env')
}

const JWT_SECRET: string = jwtSecret

export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { id?: string }
    if (!payload?.id || typeof payload.id !== 'string') {
      return res.status(401).json({ error: 'Token invalide ou expiré' })
    }
    ;(req as Request & { user: { id: string } }).user = { id: payload.id }
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

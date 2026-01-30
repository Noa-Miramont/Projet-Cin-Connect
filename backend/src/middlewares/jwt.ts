import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string }
    ;(req as Request & { user: { id: string } }).user = { id: payload.id }
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalide' })
  }
}

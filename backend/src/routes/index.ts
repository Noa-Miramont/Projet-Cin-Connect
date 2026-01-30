import { Router } from 'express'
import { authRouter } from './auth'

const router: ReturnType<typeof Router> = Router()

router.use('/auth', authRouter)

router.get('/', (_req, res) => {
  res.json({ message: 'CinéConnect API v1' })
})

export { router }

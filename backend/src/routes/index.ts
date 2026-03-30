import { Router } from 'express'
import { authRouter } from './auth'
import { categoriesRouter } from './categories'
import { filmsRouter } from './films'
import { reviewsRouter } from './reviews'
import { usersRouter } from './users'
import { friendsRouter } from './friends'
import { messagesRouter } from './messages'
import { watchlistRouter } from './watchlist'

const router: ReturnType<typeof Router> = Router()

router.use('/auth', authRouter)
router.use('/categories', categoriesRouter)
router.use('/films', filmsRouter)
router.use('/reviews', reviewsRouter)
router.use('/users', usersRouter)
router.use('/friends', friendsRouter)
router.use('/messages', messagesRouter)
router.use('/watchlist', watchlistRouter)

router.get('/', (_req, res) => {
  res.json({ message: 'Dolly Zoom API v1' })
})

export { router }

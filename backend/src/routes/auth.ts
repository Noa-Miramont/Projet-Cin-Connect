import { Router } from 'express'
import { authController } from '../controllers/auth'
import { jwtAuth } from '../middlewares/jwt'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Inscription
 */
router.post('/register', authController.register)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion
 */
router.post('/login', authController.login)

router.get('/me', jwtAuth, authController.me)

export { router as authRouter }

import { Router } from 'express'
import { authController } from '../controllers/auth'
import { jwtAuth } from '../middlewares/jwt'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Inscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email: { type: string }
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Compte créé, retourne user et token
 *       400:
 *         description: Email ou pseudo déjà utilisé
 */
router.post('/register', authController.register)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Retourne user, accessToken et refreshToken
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', authController.login)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rafraichir un access token via refresh token
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Retourne un nouvel accessToken
 *       400:
 *         description: refreshToken manquant
 *       401:
 *         description: refreshToken invalide
 */
router.post('/refresh', authController.refresh)

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Profil de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil
 *       401:
 *         description: Non authentifié
 */
router.get('/me', jwtAuth, authController.me)

export { router as authRouter }

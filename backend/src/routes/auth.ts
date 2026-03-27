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
router.post('/signup', authController.register)

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
 * /auth/forgot-password:
 *   post:
 *     summary: Génère un lien de réinitialisation du mot de passe et l'envoie par email
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Message de confirmation
 *       400:
 *         description: Erreur de saisie ou utilisateur non trouvé
 */
router.post('/forgot-password', authController.forgotPassword)

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe via token
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour
 *       400:
 *         description: Token invalide ou données invalides
 */
router.post('/reset-password', authController.resetPassword)

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

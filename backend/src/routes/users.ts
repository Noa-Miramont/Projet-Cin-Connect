import { Router } from 'express'
import { userController } from '../controllers/user'
import { jwtAuth } from '../middlewares/jwt'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /users/me:
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
router.get('/me', jwtAuth, userController.me)

/**
 * @openapi
 * /users/me/reviews:
 *   get:
 *     summary: Mes avis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des avis
 */
router.get('/me/reviews', jwtAuth, userController.myReviews)

/**
 * @openapi
 * /users/search:
 *   get:
 *     summary: Recherche d'utilisateurs par pseudo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste d'utilisateurs
 */
router.get('/search', jwtAuth, userController.search)

export { router as usersRouter }

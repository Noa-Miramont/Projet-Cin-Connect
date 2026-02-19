import { Router } from 'express'
import { reviewController } from '../controllers/review'
import { jwtAuth } from '../middlewares/jwt'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /reviews:
 *   get:
 *     summary: Liste des avis d'un film
 *     parameters:
 *       - in: query
 *         name: filmId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des avis
 */
router.get('/', reviewController.list)

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Créer un avis (authentifié)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filmId, rating]
 *             properties:
 *               filmId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Avis créé
 *       401:
 *         description: Non authentifié
 *       409:
 *         description: Déjà noté ce film
 */
router.post('/', jwtAuth, reviewController.create)

export { router as reviewsRouter }

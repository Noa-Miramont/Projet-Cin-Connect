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

/**
 * @openapi
 * /reviews/{filmId}:
 *   put:
 *     summary: Remplacer un avis (authentifié)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filmId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Avis remplacé
 *       400:
 *         description: Mauvaise requête
 *       401:
 *         description: Non authentifié
 */
router.put('/:filmId', jwtAuth, reviewController.replace)

/**
 * @openapi
 * /reviews/{filmId}:
 *   delete:
 *     summary: Supprimer son avis sur un film (authentifié)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filmId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Avis supprimé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Avis introuvable
 */
router.delete('/:filmId', jwtAuth, reviewController.delete)

export { router as reviewsRouter }

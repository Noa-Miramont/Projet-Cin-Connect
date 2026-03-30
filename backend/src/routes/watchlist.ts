import { Router } from 'express'
import { jwtAuth } from '../middlewares/jwt'
import { watchlistController } from '../controllers/watchlist'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /watchlist:
 *   get:
 *     summary: Liste la watchlist de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist courante
 *       401:
 *         description: Non authentifié
 */
router.get('/', jwtAuth, watchlistController.list)

/**
 * @openapi
 * /watchlist:
 *   post:
 *     summary: Ajoute un film à la watchlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filmId]
 *             properties:
 *               filmId: { type: string }
 *     responses:
 *       201:
 *         description: Film ajouté
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Film introuvable
 *       409:
 *         description: Déjà dans la watchlist
 */
router.post('/', jwtAuth, watchlistController.add)

/**
 * @openapi
 * /watchlist/{filmId}:
 *   delete:
 *     summary: Supprime un film de la watchlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filmId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Film supprimé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Film absent de la watchlist
 */
router.delete('/:filmId', jwtAuth, watchlistController.delete)

export { router as watchlistRouter }

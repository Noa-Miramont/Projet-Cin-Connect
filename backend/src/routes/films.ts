import { Router } from 'express'
import { filmController } from '../controllers/film'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /films:
 *   get:
 *     summary: Liste des films (pagination, filtres)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: rating
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [year, title] }
 *     responses:
 *       200:
 *         description: Liste des films et total
 */
router.get('/', filmController.list)

/**
 * @openapi
 * /films/{id}:
 *   get:
 *     summary: Détail d'un film (avec note moyenne et avis)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Film avec note moyenne et avis
 *       404:
 *         description: Film non trouvé
 */
router.get('/:id', filmController.getById)

export { router as filmsRouter }

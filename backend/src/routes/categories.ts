import { Router } from 'express'
import { categoryController } from '../controllers/category'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Liste des catégories
 *     responses:
 *       200:
 *         description: Liste des catégories
 */
router.get('/', categoryController.list)

export { router as categoriesRouter }

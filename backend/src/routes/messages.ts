import { Router } from 'express'
import { messageController } from '../controllers/message'
import { jwtAuth } from '../middlewares/jwt'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /messages:
 *   get:
 *     summary: Historique de conversation avec un ami
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des messages
 *       403:
 *         description: Pas ami avec cet utilisateur
 */
router.get('/', jwtAuth, messageController.list)

export { router as messagesRouter }

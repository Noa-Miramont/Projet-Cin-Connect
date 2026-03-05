import { Router } from 'express'
import { friendController } from '../controllers/friend'
import { jwtAuth } from '../middlewares/jwt'

const router: ReturnType<typeof Router> = Router()

/**
 * @openapi
 * /friends:
 *   get:
 *     summary: Liste des amis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des amis
 */
router.get('/', jwtAuth, friendController.list)

/**
 * @openapi
 * /friends:
 *   post:
 *     summary: Ajouter un ami (par pseudo)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username]
 *             properties:
 *               username: { type: string }
 *     responses:
 *       201:
 *         description: Ami ajouté
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/', jwtAuth, friendController.add)

/**
 * @openapi
 * /friends/requests/received:
 *   get:
 *     summary: Liste des demandes d'amis reçues (PENDING)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes reçues
 */
router.get('/requests/received', jwtAuth, friendController.listReceivedRequests)

/**
 * @openapi
 * /friends/requests/{id}/accept:
 *   post:
 *     summary: Accepter une demande d'ami
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Demande acceptée
 *       404:
 *         description: Demande introuvable
 */
router.post('/requests/:id/accept', jwtAuth, friendController.acceptRequest)

/**
 * @openapi
 * /friends/requests/{id}:
 *   delete:
 *     summary: Refuser une demande d'ami
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Demande refusée
 *       404:
 *         description: Demande introuvable
 */
router.delete('/requests/:id', jwtAuth, friendController.declineRequest)

/**
 * @openapi
 * /friends/{id}:
 *   delete:
 *     summary: Retirer un ami
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Ami retiré
 *       404:
 *         description: Ami non trouvé
 */
router.delete('/:id', jwtAuth, friendController.remove)

export { router as friendsRouter }

import { Request, Response } from 'express'
import { friendService } from '../services/friend'
import { emitNewFriendRequest } from '../sockets'

type AuthRequest = Request & { user?: { id: string } }
const FRIEND_FLOW_DEBUG = process.env.FRIEND_FLOW_DEBUG === '1'

function friendDebugLog(message: string, payload?: unknown) {
  if (!FRIEND_FLOW_DEBUG) return
  if (payload === undefined) {
    console.log(`[FriendFlow][Controller] ${message}`)
    return
  }
  console.log(`[FriendFlow][Controller] ${message}`, payload)
}

export const friendController = {
  async list(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const friends = await friendService.list(user.id)
      res.json(friends)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async add(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const { username } = req.body
      const trimmedUsername = username?.trim()
      friendDebugLog('friend request received', {
        senderId: user.id,
        rawUsername: username,
        trimmedUsername
      })
      if (!trimmedUsername) {
        return res.status(400).json({ error: 'username requis' })
      }
      const result = await friendService.add(user.id, trimmedUsername)
      emitNewFriendRequest(result.friend_id, {
        requestId: result.id,
        requesterId: user.id
      })
      friendDebugLog('friend request created', {
        senderId: user.id,
        targetUsername: trimmedUsername,
        result
      })
      res.status(201).json(result)
    } catch (err) {
      const msg = (err as Error).message
      friendDebugLog('friend request failed', {
        senderId: user.id,
        reason: msg
      })
      if (msg.includes('non trouvé')) return res.status(404).json({ error: msg })
      if (msg.includes('Déjà ami')) return res.status(409).json({ error: msg })
      if (msg.includes('déjà envoyé')) return res.status(409).json({ error: msg })
      if (msg.includes('déjà envoyé une demande')) {
        return res.status(409).json({ error: msg })
      }
      if (msg.includes('vous-même')) return res.status(400).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  },

  async listReceivedRequests(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const requests = await friendService.listReceivedRequests(user.id)
      friendDebugLog('received requests fetched', {
        receiverId: user.id,
        count: requests.length,
        requestIds: requests.map((r) => r.id)
      })
      res.json(requests)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async acceptRequest(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const { id } = req.params
      const result = await friendService.acceptRequest(user.id, id)
      res.json(result)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('introuvable')) return res.status(404).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  },

  async declineRequest(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const { id } = req.params
      await friendService.declineRequest(user.id, id)
      res.status(204).send()
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('introuvable')) return res.status(404).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  },

  async remove(req: AuthRequest, res: Response) {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Non authentifié' })
    try {
      const { id } = req.params
      await friendService.remove(user.id, id)
      res.status(204).send()
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('non trouvé')) return res.status(404).json({ error: msg })
      res.status(500).json({ error: msg })
    }
  }
}

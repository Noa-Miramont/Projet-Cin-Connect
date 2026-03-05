import { friendRepository } from '../repositories/friend'
import { userRepository } from '../repositories/user'

const FRIEND_FLOW_DEBUG = process.env.FRIEND_FLOW_DEBUG === '1'

function friendDebugLog(message: string, payload?: unknown) {
  if (!FRIEND_FLOW_DEBUG) return
  if (payload === undefined) {
    console.log(`[FriendFlow][Service] ${message}`)
    return
  }
  console.log(`[FriendFlow][Service] ${message}`, payload)
}

export const friendService = {
  async list(userId: string) {
    return friendRepository.findAcceptedByUserId(userId)
  },

  async listReceivedRequests(userId: string) {
    return friendRepository.findReceivedPendingByUserId(userId)
  },

  async add(userId: string, username: string) {
    friendDebugLog('resolving username', { senderId: userId, username })
    const friend = await userRepository.findByUsername(username)
    friendDebugLog('username resolution result', {
      senderId: userId,
      username,
      found: !!friend,
      targetUserId: friend?.id
    })
    if (!friend) throw new Error('Utilisateur non trouvé')
    if (friend.id === userId) throw new Error('Vous ne pouvez pas vous ajouter vous-même')
    const existing = await friendRepository.findAnyRelationshipBetween(userId, friend.id)
    friendDebugLog('existing relationships fetched', {
      senderId: userId,
      targetUserId: friend.id,
      existingCount: existing.length,
      existing: existing.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        friend_id: row.friend_id,
        status: row.status
      }))
    })

    const accepted = existing.find((r) => r.status === 'ACCEPTED')
    if (accepted) throw new Error('Déjà ami avec cet utilisateur')

    const sentPending = existing.find(
      (r) =>
        r.status === 'PENDING' &&
        r.user_id === userId &&
        r.friend_id === friend.id
    )
    if (sentPending) throw new Error('Demande déjà envoyée')

    const receivedPending = existing.find(
      (r) =>
        r.status === 'PENDING' &&
        r.user_id === friend.id &&
        r.friend_id === userId
    )
    if (receivedPending) {
      throw new Error('Cet utilisateur vous a déjà envoyé une demande')
    }

    const row = await friendRepository.createRequest(userId, friend.id)
    friendDebugLog('friend request inserted in db', {
      requestId: row.id,
      senderId: row.user_id,
      receiverId: row.friend_id,
      status: row.status
    })
    return {
      id: row.id,
      friend_id: row.friend_id,
      username: friend.username,
      status: row.status
    }
  },

  async acceptRequest(userId: string, requestId: string) {
    const row = await friendRepository.acceptRequest(requestId, userId)
    if (!row) throw new Error('Demande introuvable')
    const requester = await userRepository.findById(row.user_id)
    return {
      id: row.id,
      friend_id: requester?.id ?? row.user_id,
      username: requester?.username ?? 'Utilisateur',
      status: row.status
    }
  },

  async declineRequest(userId: string, requestId: string) {
    const row = await friendRepository.declineRequest(requestId, userId)
    if (!row) throw new Error('Demande introuvable')
    return { ok: true }
  },

  async remove(userId: string, id: string) {
    const row = await friendRepository.removeAccepted(id, userId)
    if (!row) throw new Error('Ami non trouvé')
    return { ok: true }
  }
}

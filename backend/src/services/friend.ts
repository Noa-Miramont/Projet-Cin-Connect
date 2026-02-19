import { friendRepository } from '../repositories/friend'
import { userRepository } from '../repositories/user'

export const friendService = {
  async list(userId: string) {
    return friendRepository.findByUserId(userId)
  },

  async add(userId: string, username: string) {
    const friend = await userRepository.findByUsername(username)
    if (!friend) throw new Error('Utilisateur non trouvé')
    if (friend.id === userId) throw new Error('Vous ne pouvez pas vous ajouter vous-même')
    const existing = await friendRepository.findFriendship(userId, friend.id)
    if (existing) throw new Error('Déjà ami avec cet utilisateur')
    const row = await friendRepository.add(userId, friend.id)
    return { id: row!.id, friend_id: row!.friend_id, username: friend.username }
  },

  async remove(userId: string, id: string) {
    const row = await friendRepository.findById(id, userId)
    if (!row) throw new Error('Ami non trouvé')
    await friendRepository.remove(id, userId)
    return { ok: true }
  }
}

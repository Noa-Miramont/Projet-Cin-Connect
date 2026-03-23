import { messageRepository } from '../repositories/message'
import { friendRepository } from '../repositories/friend'

export const messageService = {
  async getConversation(userId: string, otherUserId: string, limit?: number) {
    const canChat = await friendRepository.areAcceptedFriends(userId, otherUserId)
    if (!canChat) {
      throw new Error('Vous ne pouvez discuter qu’avec vos amis')
    }
    return messageRepository.getConversation(userId, otherUserId, limit)
  },

  async send(senderId: string, receiverId: string, content: string) {
    const canChat = await friendRepository.areAcceptedFriends(senderId, receiverId)
    if (!canChat) {
      throw new Error('Vous ne pouvez discuter qu’avec vos amis')
    }
    const msg = await messageRepository.create({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim()
    })
    return msg
  }
}

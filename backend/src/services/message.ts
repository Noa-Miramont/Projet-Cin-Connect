import { messageRepository } from '../repositories/message'
import { friendRepository } from '../repositories/friend'

function isFriend(userId: string, friendId: string, friends: { friend_id: string }[]) {
  return friends.some((f) => f.friend_id === friendId)
}

export const messageService = {
  async getConversation(userId: string, otherUserId: string, limit?: number) {
    const myFriends = await friendRepository.findByUserId(userId)
    if (!isFriend(userId, otherUserId, myFriends)) {
      throw new Error('Vous ne pouvez discuter qu’avec vos amis')
    }
    return messageRepository.getConversation(userId, otherUserId, limit)
  },

  async send(senderId: string, receiverId: string, content: string) {
    const myFriends = await friendRepository.findByUserId(senderId)
    if (!isFriend(senderId, receiverId, myFriends)) {
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

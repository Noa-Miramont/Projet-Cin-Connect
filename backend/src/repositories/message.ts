import { eq, and, or, desc } from 'drizzle-orm'
import { db } from '../db'
import { messages, users } from '../db/schema'

export const messageRepository = {
  async create(data: {
    sender_id: string
    receiver_id: string
    content: string
  }) {
    const [msg] = await db.insert(messages).values(data).returning()
    return msg
  },

  async getConversation(userId: string, otherUserId: string, limit = 50) {
    return db
      .select({
        id: messages.id,
        sender_id: messages.sender_id,
        receiver_id: messages.receiver_id,
        content: messages.content,
        created_at: messages.created_at,
        sender_username: users.username
      })
      .from(messages)
      .leftJoin(users, eq(messages.sender_id, users.id))
      .where(
        or(
          and(
            eq(messages.sender_id, userId),
            eq(messages.receiver_id, otherUserId)
          ),
          and(
            eq(messages.sender_id, otherUserId),
            eq(messages.receiver_id, userId)
          )
        )
      )
      .orderBy(desc(messages.created_at))
      .limit(limit)
  }
}

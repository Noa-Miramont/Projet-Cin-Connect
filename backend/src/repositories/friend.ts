import { eq, and, or } from 'drizzle-orm'
import { db } from '../db'
import { friends, users } from '../db/schema'

export const friendRepository = {
  async add(userId: string, friendId: string) {
    if (userId === friendId) return null
    const [row] = await db
      .insert(friends)
      .values({ user_id: userId, friend_id: friendId })
      .returning()
    return row
  },

  async remove(id: string, userId: string) {
    const [deleted] = await db
      .delete(friends)
      .where(and(eq(friends.id, id), eq(friends.user_id, userId)))
      .returning({ id: friends.id })
    return deleted
  },

  async findByUserId(userId: string) {
    const rows = await db
      .select({
        id: friends.id,
        friend_id: users.id,
        username: users.username,
        email: users.email
      })
      .from(friends)
      .innerJoin(users, eq(friends.friend_id, users.id))
      .where(eq(friends.user_id, userId))
    return rows
  },

  async findFriendship(userId: string, friendId: string) {
    const [row] = await db
      .select()
      .from(friends)
      .where(
        and(eq(friends.user_id, userId), eq(friends.friend_id, friendId))
      )
    return row
  },

  async findById(id: string, userId: string) {
    const [row] = await db
      .select()
      .from(friends)
      .where(and(eq(friends.id, id), eq(friends.user_id, userId)))
    return row
  }
}

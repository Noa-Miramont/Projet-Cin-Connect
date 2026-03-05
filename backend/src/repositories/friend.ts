import { eq, and, or, desc } from 'drizzle-orm'
import { db } from '../db'
import { friends, users } from '../db/schema'

export const friendRepository = {
  async createRequest(userId: string, friendId: string) {
    const [row] = await db
      .insert(friends)
      .values({ user_id: userId, friend_id: friendId, status: 'PENDING' })
      .returning()
    return row
  },

  async removeAccepted(id: string, userId: string) {
    const [deleted] = await db
      .delete(friends)
      .where(
        and(
          eq(friends.id, id),
          eq(friends.status, 'ACCEPTED'),
          or(eq(friends.user_id, userId), eq(friends.friend_id, userId))
        )
      )
      .returning({ id: friends.id })
    return deleted
  },

  async findAcceptedByUserId(userId: string) {
    const sentAccepted = await db
      .select({
        id: friends.id,
        friend_id: users.id,
        username: users.username,
        email: users.email
      })
      .from(friends)
      .innerJoin(users, eq(friends.friend_id, users.id))
      .where(
        and(eq(friends.user_id, userId), eq(friends.status, 'ACCEPTED'))
      )

    const receivedAccepted = await db
      .select({
        id: friends.id,
        friend_id: users.id,
        username: users.username,
        email: users.email
      })
      .from(friends)
      .innerJoin(users, eq(friends.user_id, users.id))
      .where(
        and(eq(friends.friend_id, userId), eq(friends.status, 'ACCEPTED'))
      )

    return [...sentAccepted, ...receivedAccepted]
  },

  async findReceivedPendingByUserId(userId: string) {
    return db
      .select({
        id: friends.id,
        requester_id: users.id,
        username: users.username,
        email: users.email,
        created_at: friends.created_at
      })
      .from(friends)
      .innerJoin(users, eq(friends.user_id, users.id))
      .where(
        and(eq(friends.friend_id, userId), eq(friends.status, 'PENDING'))
      )
      .orderBy(desc(friends.created_at))
  },

  async findAnyRelationshipBetween(userId: string, otherUserId: string) {
    return db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.user_id, userId), eq(friends.friend_id, otherUserId)),
          and(eq(friends.user_id, otherUserId), eq(friends.friend_id, userId))
        )
      )
  },

  async acceptRequest(id: string, userId: string) {
    const [row] = await db
      .update(friends)
      .set({ status: 'ACCEPTED' })
      .where(
        and(
          eq(friends.id, id),
          eq(friends.friend_id, userId),
          eq(friends.status, 'PENDING')
        )
      )
      .returning()
    return row
  },

  async declineRequest(id: string, userId: string) {
    const [row] = await db
      .delete(friends)
      .where(
        and(
          eq(friends.id, id),
          eq(friends.friend_id, userId),
          eq(friends.status, 'PENDING')
        )
      )
      .returning({ id: friends.id })
    return row
  },

  async areAcceptedFriends(userId: string, otherUserId: string) {
    const [row] = await db
      .select({ id: friends.id })
      .from(friends)
      .where(
        and(
          eq(friends.status, 'ACCEPTED'),
          or(
            and(eq(friends.user_id, userId), eq(friends.friend_id, otherUserId)),
            and(eq(friends.user_id, otherUserId), eq(friends.friend_id, userId))
          )
        )
      )
    return !!row
  }
}

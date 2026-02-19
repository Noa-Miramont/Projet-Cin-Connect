import { eq, ilike } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'

export const userRepository = {
  async create(data: {
    username: string
    email: string
    password: string
  }) {
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        password: data.password
      })
      .returning()
    return user
  },

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email))
    return user
  },

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user
  },

  async findByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    return user
  },

  async searchByUsername(query: string, limit: number) {
    return db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .where(ilike(users.username, `%${query}%`))
      .limit(limit)
  }
}

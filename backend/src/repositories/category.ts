import { eq, asc } from 'drizzle-orm'
import { db } from '../db'
import { categories } from '../db/schema'

export const categoryRepository = {
  async findAll() {
    return db.select().from(categories).orderBy(asc(categories.name))
  },

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
    return row
  },

  async findByName(name: string) {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
    return row
  },

  async create(name: string) {
    const [row] = await db.insert(categories).values({ name }).returning()
    return row
  }
}

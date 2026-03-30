import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { films, watchlistItems } from '../db/schema'

export const watchlistRepository = {
  async listByUserId(userId: string) {
    return db
      .select({
        id: films.id,
        title: films.title,
        posterUrl: films.poster_url,
        addedAt: watchlistItems.created_at
      })
      .from(watchlistItems)
      .innerJoin(films, eq(watchlistItems.film_id, films.id))
      .where(eq(watchlistItems.user_id, userId))
      .orderBy(desc(watchlistItems.created_at))
  },

  async findByUserAndFilm(userId: string, filmId: string) {
    const [row] = await db
      .select()
      .from(watchlistItems)
      .where(
        and(eq(watchlistItems.user_id, userId), eq(watchlistItems.film_id, filmId))
      )
    return row
  },

  async findWatchlistFilm(userId: string, filmId: string) {
    const [row] = await db
      .select({
        id: films.id,
        title: films.title,
        posterUrl: films.poster_url,
        addedAt: watchlistItems.created_at
      })
      .from(watchlistItems)
      .innerJoin(films, eq(watchlistItems.film_id, films.id))
      .where(
        and(eq(watchlistItems.user_id, userId), eq(watchlistItems.film_id, filmId))
      )
    return row
  },

  async create(data: { user_id: string; film_id: string }) {
    const [row] = await db.insert(watchlistItems).values(data).returning()
    return row
  },

  async deleteByUserAndFilm(userId: string, filmId: string) {
    const [row] = await db
      .delete(watchlistItems)
      .where(
        and(eq(watchlistItems.user_id, userId), eq(watchlistItems.film_id, filmId))
      )
      .returning({ filmId: watchlistItems.film_id })
    return row
  }
}

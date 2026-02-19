import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db'
import { reviews, users, films } from '../db/schema'

export const reviewRepository = {
  async create(data: {
    user_id: string
    film_id: string
    rating: number
    comment?: string
  }) {
    const [review] = await db.insert(reviews).values(data).returning()
    return review
  },

  async findByFilmId(filmId: string) {
    return db
      .select({
        id: reviews.id,
        user_id: reviews.user_id,
        film_id: reviews.film_id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
        username: users.username
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.user_id, users.id))
      .where(eq(reviews.film_id, filmId))
      .orderBy(desc(reviews.created_at))
  },

  async findByUserId(userId: string) {
    return db
      .select({
        id: reviews.id,
        user_id: reviews.user_id,
        film_id: reviews.film_id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
        film_title: films.title
      })
      .from(reviews)
      .innerJoin(films, eq(reviews.film_id, films.id))
      .where(eq(reviews.user_id, userId))
      .orderBy(desc(reviews.created_at))
  },

  async findUserReviewForFilm(userId: string, filmId: string) {
    const [row] = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.user_id, userId), eq(reviews.film_id, filmId))
      )
    return row
  },

  async delete(id: string, userId: string) {
    const [deleted] = await db
      .delete(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.user_id, userId)))
      .returning({ id: reviews.id })
    return deleted
  }
}

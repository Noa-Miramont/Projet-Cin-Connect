import { eq, and, ilike, desc, asc, sql, count, inArray } from 'drizzle-orm'
import { db } from '../db'
import { films, reviews } from '../db/schema'

const PER_PAGE = 20

export const filmRepository = {
  async findAll(opts: {
    page?: number
    limit?: number
    category?: string
    year?: number
    minRating?: number
    search?: string
    sort?: string
  }) {
    const page = Math.max(1, opts.page ?? 1)
    const limit = Math.min(100, Math.max(1, opts.limit ?? PER_PAGE))
    const offset = (page - 1) * limit

    const conditions = []
    if (opts.category) {
      conditions.push(eq(films.category_id, opts.category))
    }
    if (opts.year != null) {
      conditions.push(eq(films.year, opts.year))
    }
    if (opts.search?.trim()) {
      conditions.push(ilike(films.title, `%${opts.search.trim()}%`))
    }

    if (opts.minRating != null && opts.minRating > 0) {
      const withAvg = await db
        .select({
          filmId: reviews.film_id,
          avgRating: sql<number>`avg(${reviews.rating})::float`
        })
        .from(reviews)
        .groupBy(reviews.film_id)
      const passingIds = withAvg
        .filter((r) => r.avgRating >= opts.minRating!)
        .map((r) => r.filmId)
      if (passingIds.length > 0) {
        conditions.push(inArray(films.id, passingIds))
      } else {
        return { list: [], total: 0 }
      }
    }

    const orderBy =
      opts.sort === 'year'
        ? desc(films.year)
        : opts.sort === 'title'
          ? asc(films.title)
          : desc(films.year)

    const list = await db
      .select()
      .from(films)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(films)
      .where(conditions.length ? and(...conditions) : undefined)
    return { list, total: total ?? 0 }
  },

  async findById(id: string) {
    const [film] = await db.select().from(films).where(eq(films.id, id))
    return film
  },

  async getAverageRating(filmId: string): Promise<number | null> {
    const [row] = await db
      .select({ avg: sql<number>`avg(${reviews.rating})::float` })
      .from(reviews)
      .where(eq(reviews.film_id, filmId))
    return row?.avg ?? null
  },

  async create(data: {
    title: string
    description?: string
    year?: number
    director?: string
    poster_url?: string
    category_id?: string
  }) {
    const [film] = await db.insert(films).values(data).returning()
    return film
  }
}

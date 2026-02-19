import { filmRepository } from '../repositories/film'
import { reviewRepository } from '../repositories/review'

export const filmService = {
  async list(opts: {
    page?: number
    limit?: number
    category?: string
    year?: number
    minRating?: number
    search?: string
    sort?: string
  }) {
    return filmRepository.findAll(opts)
  },

  async getById(id: string) {
    const film = await filmRepository.findById(id)
    if (!film) return null
    const avgRating = await filmRepository.getAverageRating(id)
    const reviews = await reviewRepository.findByFilmId(id)
    return {
      ...film,
      averageRating: avgRating ?? undefined,
      reviews
    }
  }
}

import { reviewRepository } from '../repositories/review'

export const reviewService = {
  async create(userId: string, data: { filmId: string; rating: number; comment?: string }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('La note doit être entre 1 et 5')
    }
    const existing = await reviewRepository.findUserReviewForFilm(userId, data.filmId)
    if (existing) throw new Error('Vous avez déjà noté ce film')
    const review = await reviewRepository.create({
      user_id: userId,
      film_id: data.filmId,
      rating: data.rating,
      comment: data.comment
    })
    return review
  },

  async listByFilm(filmId: string) {
    return reviewRepository.findByFilmId(filmId)
  },

  async listByUser(userId: string) {
    return reviewRepository.findByUserId(userId)
  }
}

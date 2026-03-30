import { filmRepository } from '../repositories/film'
import { watchlistRepository } from '../repositories/watchlist'

export const watchlistService = {
  async listByUser(userId: string) {
    return watchlistRepository.listByUserId(userId)
  },

  async add(userId: string, filmId: string) {
    const film = await filmRepository.findById(filmId)
    if (!film) {
      throw new Error('Film introuvable')
    }

    const existing = await watchlistRepository.findByUserAndFilm(userId, filmId)
    if (existing) {
      throw new Error('Film déjà présent dans la watchlist')
    }

    await watchlistRepository.create({
      user_id: userId,
      film_id: filmId
    })

    const item = await watchlistRepository.findWatchlistFilm(userId, filmId)
    if (!item) {
      throw new Error('Impossible de charger le film ajouté à la watchlist')
    }

    return item
  },

  async remove(userId: string, filmId: string) {
    const existing = await watchlistRepository.findByUserAndFilm(userId, filmId)
    if (!existing) {
      throw new Error('Film absent de la watchlist')
    }

    const deleted = await watchlistRepository.deleteByUserAndFilm(userId, filmId)
    if (!deleted) {
      throw new Error('Film absent de la watchlist')
    }

    return deleted
  }
}

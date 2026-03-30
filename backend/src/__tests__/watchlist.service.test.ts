jest.mock('../repositories/watchlist', () => ({
  watchlistRepository: {
    listByUserId: jest.fn(),
    findByUserAndFilm: jest.fn(),
    findWatchlistFilm: jest.fn(),
    create: jest.fn(),
    deleteByUserAndFilm: jest.fn()
  }
}))

jest.mock('../repositories/film', () => ({
  filmRepository: {
    findById: jest.fn()
  }
}))

import { watchlistService } from '../services/watchlist'
import { watchlistRepository } from '../repositories/watchlist'
import { filmRepository } from '../repositories/film'

const mockedWatchlistRepository = watchlistRepository as jest.Mocked<typeof watchlistRepository>
const mockedFilmRepository = filmRepository as jest.Mocked<typeof filmRepository>

describe('watchlistService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should add a film to the authenticated user watchlist', async () => {
    mockedFilmRepository.findById.mockResolvedValueOnce({
      id: 'film-1',
      title: 'Inception'
    } as never)
    mockedWatchlistRepository.findByUserAndFilm.mockResolvedValueOnce(undefined as never)
    mockedWatchlistRepository.create.mockResolvedValueOnce({
      id: 'item-1',
      user_id: 'user-1',
      film_id: 'film-1'
    } as never)
    mockedWatchlistRepository.findWatchlistFilm.mockResolvedValueOnce({
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg',
      addedAt: '2026-03-30T10:00:00.000Z'
    } as never)

    await expect(watchlistService.add('user-1', 'film-1')).resolves.toEqual({
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg',
      addedAt: '2026-03-30T10:00:00.000Z'
    })
  })

  it('should reject when the film does not exist', async () => {
    mockedFilmRepository.findById.mockResolvedValueOnce(undefined as never)

    await expect(watchlistService.add('user-1', 'film-404')).rejects.toThrow(
      'Film introuvable'
    )
  })

  it('should reject duplicates in watchlist', async () => {
    mockedFilmRepository.findById.mockResolvedValueOnce({
      id: 'film-1',
      title: 'Inception'
    } as never)
    mockedWatchlistRepository.findByUserAndFilm.mockResolvedValueOnce({
      id: 'item-1',
      user_id: 'user-1',
      film_id: 'film-1'
    } as never)

    await expect(watchlistService.add('user-1', 'film-1')).rejects.toThrow(
      'Film déjà présent dans la watchlist'
    )
  })

  it('should remove a film already stored in watchlist', async () => {
    mockedWatchlistRepository.findByUserAndFilm.mockResolvedValueOnce({
      id: 'item-1',
      user_id: 'user-1',
      film_id: 'film-1'
    } as never)
    mockedWatchlistRepository.deleteByUserAndFilm.mockResolvedValueOnce({
      filmId: 'film-1'
    } as never)

    await expect(watchlistService.remove('user-1', 'film-1')).resolves.toEqual({
      filmId: 'film-1'
    })
  })

  it('should reject when the film is absent from watchlist', async () => {
    mockedWatchlistRepository.findByUserAndFilm.mockResolvedValueOnce(undefined as never)

    await expect(watchlistService.remove('user-1', 'film-1')).rejects.toThrow(
      'Film absent de la watchlist'
    )
  })
})

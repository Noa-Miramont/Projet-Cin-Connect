import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiGetMock = vi.fn()
const apiPostMock = vi.fn()
const apiDeleteMock = vi.fn()

vi.mock('./api', () => ({
  api: {
    get: (...args: unknown[]) => apiGetMock(...args),
    post: (...args: unknown[]) => apiPostMock(...args),
    delete: (...args: unknown[]) => apiDeleteMock(...args)
  }
}))

import {
  addFilmToWatchlist,
  fetchWatchlist,
  isFilmInWatchlist,
  removeFilmFromWatchlist
} from './watchlist'

describe('watchlist service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the authenticated user watchlist from the API', async () => {
    apiGetMock.mockResolvedValueOnce({
      data: [
        {
          id: 'film-1',
          title: 'Inception',
          posterUrl: '/poster.jpg',
          addedAt: '2026-03-30T10:00:00.000Z'
        }
      ]
    })

    await expect(fetchWatchlist()).resolves.toEqual([
      {
        id: 'film-1',
        title: 'Inception',
        posterUrl: '/poster.jpg',
        addedAt: '2026-03-30T10:00:00.000Z'
      }
    ])
    expect(apiGetMock).toHaveBeenCalledWith('/watchlist')
  })

  it('adds a film to the API-backed watchlist', async () => {
    apiPostMock.mockResolvedValueOnce({
      data: {
        id: 'film-1',
        title: 'Inception',
        posterUrl: '/poster.jpg',
        addedAt: '2026-03-30T10:00:00.000Z'
      }
    })

    await expect(addFilmToWatchlist('film-1')).resolves.toEqual({
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg',
      addedAt: '2026-03-30T10:00:00.000Z'
    })
    expect(apiPostMock).toHaveBeenCalledWith('/watchlist', { filmId: 'film-1' })
  })

  it('removes a film from the API-backed watchlist', async () => {
    apiDeleteMock.mockResolvedValueOnce({})

    await expect(removeFilmFromWatchlist('film-1')).resolves.toBeUndefined()
    expect(apiDeleteMock).toHaveBeenCalledWith('/watchlist/film-1')
  })

  it('detects when a film is already present in a fetched watchlist', () => {
    expect(
      isFilmInWatchlist(
        [
          {
            id: 'film-1',
            title: 'Inception',
            posterUrl: '/poster.jpg',
            addedAt: '2026-03-30T10:00:00.000Z'
          }
        ],
        'film-1'
      )
    ).toBe(true)
  })

  it('returns false when the film is not in the fetched watchlist', () => {
    expect(isFilmInWatchlist([], 'film-1')).toBe(false)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { navigateToWatchlistFilm } from './Discussion'

describe('navigateToWatchlistFilm', () => {
  it('navigates to the clicked film detail route', () => {
    const navigate = vi.fn()

    navigateToWatchlistFilm(navigate, 'film-42')

    expect(navigate).toHaveBeenCalledWith({
      to: '/film/$id',
      params: { id: 'film-42' }
    })
  })

  it('does nothing when the film id is missing', () => {
    const navigate = vi.fn()

    navigateToWatchlistFilm(navigate, '')

    expect(navigate).not.toHaveBeenCalled()
  })
})

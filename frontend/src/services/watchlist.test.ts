import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addFilmToWatchlist,
  getWatchlist,
  isFilmInWatchlist,
  removeFilmFromWatchlist,
  WATCHLIST_UPDATED_EVENT
} from './watchlist'

type LocalStorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
}

function createLocalStorageMock(): LocalStorageLike {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    }
  }
}

describe('watchlist service', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'window', {
      value: new EventTarget(),
      configurable: true
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true
    })
  })

  beforeEach(() => {
    localStorage.clear()
  })

  it('stores a film in the Dolly Zoom watchlist key', () => {
    const result = addFilmToWatchlist('user-1', {
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg'
    })

    expect(result).toHaveLength(1)
    expect(localStorage.getItem('dollyzoom_watchlist_user-1')).not.toBeNull()
    expect(getWatchlist('user-1')).toEqual(result)
    expect(isFilmInWatchlist('user-1', 'film-1')).toBe(true)
  })

  it('does not duplicate a film already in watchlist', () => {
    addFilmToWatchlist('user-1', {
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg'
    })

    const result = addFilmToWatchlist('user-1', {
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg'
    })

    expect(result).toHaveLength(1)
    expect(getWatchlist('user-1')).toHaveLength(1)
  })

  it('removes a film from watchlist cleanly', () => {
    addFilmToWatchlist('user-1', {
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg'
    })
    addFilmToWatchlist('user-1', {
      id: 'film-2',
      title: 'Interstellar',
      posterUrl: '/poster-2.jpg'
    })

    const result = removeFilmFromWatchlist('user-1', 'film-1')

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('film-2')
    expect(isFilmInWatchlist('user-1', 'film-1')).toBe(false)
  })

  it('returns an empty list when stored data is malformed', () => {
    localStorage.setItem('dollyzoom_watchlist_user-1', '{invalid-json')

    expect(getWatchlist('user-1')).toEqual([])
  })

  it('dispatches a watchlist update event when the list changes', () => {
    const listener = vi.fn()

    window.addEventListener(WATCHLIST_UPDATED_EVENT, listener)
    addFilmToWatchlist('user-1', {
      id: 'film-1',
      title: 'Inception',
      posterUrl: '/poster.jpg'
    })

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(WATCHLIST_UPDATED_EVENT, listener)
  })
})

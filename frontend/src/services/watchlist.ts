export type WatchlistFilm = {
  id: string
  title: string
  posterUrl: string
  addedAt: string
}

function getWatchlistStorageKey(userId: string) {
  return `dollyzoom_watchlist_${userId}`
}

export function getWatchlist(userId: string): WatchlistFilm[] {
  const raw = localStorage.getItem(getWatchlistStorageKey(userId))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as WatchlistFilm[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      item =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.posterUrl === 'string' &&
        typeof item.addedAt === 'string'
    )
  } catch {
    return []
  }
}

function saveWatchlist(userId: string, value: WatchlistFilm[]) {
  localStorage.setItem(getWatchlistStorageKey(userId), JSON.stringify(value))
}

export function isFilmInWatchlist(userId: string, filmId: string) {
  return getWatchlist(userId).some(film => film.id === filmId)
}

export function addFilmToWatchlist(
  userId: string,
  film: {
    id: string
    title: string
    posterUrl: string
  }
) {
  const list = getWatchlist(userId)
  if (list.some(item => item.id === film.id)) return list
  const next = [
    {
      id: film.id,
      title: film.title,
      posterUrl: film.posterUrl,
      addedAt: new Date().toISOString()
    },
    ...list
  ]
  saveWatchlist(userId, next)
  return next
}

export function removeFilmFromWatchlist(userId: string, filmId: string) {
  const next = getWatchlist(userId).filter(item => item.id !== filmId)
  saveWatchlist(userId, next)
  return next
}

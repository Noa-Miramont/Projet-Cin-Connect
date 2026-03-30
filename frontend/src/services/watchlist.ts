import { api } from './api'

export type WatchlistFilm = {
  id: string
  title: string
  posterUrl: string | null
  addedAt: string
}

export async function fetchWatchlist(): Promise<WatchlistFilm[]> {
  const { data } = await api.get<WatchlistFilm[]>('/watchlist')
  return data
}

export async function addFilmToWatchlist(filmId: string): Promise<WatchlistFilm> {
  const { data } = await api.post<WatchlistFilm>('/watchlist', { filmId })
  return data
}

export async function removeFilmFromWatchlist(filmId: string): Promise<void> {
  await api.delete(`/watchlist/${filmId}`)
}

export function isFilmInWatchlist(
  watchlist: WatchlistFilm[] | undefined,
  filmId: string
) {
  return (watchlist ?? []).some((film) => film.id === filmId)
}

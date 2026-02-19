import { api } from './api'

export type Film = {
  id: string
  title: string
  description: string | null
  year: number | null
  director: string | null
  poster_url: string | null
  category_id: string | null
}

export type FilmDetail = Film & {
  averageRating?: number
  reviews: Array<{
    id: string
    user_id: string
    film_id: string
    rating: number
    comment: string | null
    created_at: string
    username: string
  }>
}

export type FilmsResponse = { films: Film[]; total: number }

export async function fetchFilms(params: {
  page?: number
  limit?: number
  category?: string
  year?: number
  rating?: number
  search?: string
  sort?: string
}): Promise<FilmsResponse> {
  const { data } = await api.get<FilmsResponse>('/films', { params })
  return data
}

export async function fetchFilm(id: string): Promise<FilmDetail | null> {
  try {
    const { data } = await api.get<FilmDetail>(`/films/${id}`)
    return data
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'response' in e) {
      const res = (e as { response: { status: number } }).response
      if (res?.status === 404) return null
    }
    throw e
  }
}

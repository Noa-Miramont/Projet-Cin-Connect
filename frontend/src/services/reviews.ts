import { api } from './api'

export type Review = {
  id: string
  user_id: string
  film_id: string
  rating: number
  comment: string | null
  created_at: string
  username?: string
}

export async function fetchReviewsByFilm(filmId: string): Promise<Review[]> {
  const { data } = await api.get<Review[]>('/reviews', {
    params: { filmId }
  })
  return data
}

export async function createReview(params: {
  filmId: string
  rating: number
  comment?: string
}): Promise<Review> {
  const { data } = await api.post<Review>('/reviews', params)
  return data
}

export async function replaceReview(params: {
  filmId: string
  rating: number
  comment?: string
}): Promise<Review> {
  const { data } = await api.put<Review>(`/reviews/${params.filmId}`, {
    rating: params.rating,
    comment: params.comment
  })
  return data
}

export async function deleteReview(filmId: string): Promise<void> {
  await api.delete(`/reviews/${filmId}`)
}

import { api } from './api'

export type UserMe = {
  id: string
  email: string
  username: string
  createdAt: string
}

export type UserSearchHit = {
  id: string
  username: string
  email: string
}

export async function fetchMe(): Promise<UserMe> {
  const { data } = await api.get<UserMe>('/users/me')
  return data
}

export async function fetchMyReviews(): Promise<
  Array<{
    id: string
    user_id: string
    film_id: string
    rating: number
    comment: string | null
    created_at: string
    film_title: string
  }>
> {
  const { data } = await api.get('/users/me/reviews')
  return data
}

export async function searchUsers(q: string, limit = 10): Promise<UserSearchHit[]> {
  const { data } = await api.get<UserSearchHit[]>('/users/search', {
    params: { q, limit }
  })
  return data
}

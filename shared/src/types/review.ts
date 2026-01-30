import type { UserPublic } from './user'
import type { Film } from './film'

export interface Review {
  id: string
  userId: string
  filmId: string
  rating: number
  content?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReviewWithRelations extends Review {
  user?: UserPublic
  film?: Film
}

export interface ReviewCreateInput {
  filmId: string
  rating: number
  content?: string
}

export interface Film {
  id: string
  title: string
  description?: string
  posterUrl?: string
  releaseYear?: number
  duration?: number
  genre?: string[]
  rating?: number
  createdAt: Date
  updatedAt: Date
}

export interface FilmCreateInput {
  title: string
  description?: string
  posterUrl?: string
  releaseYear?: number
  duration?: number
  genre?: string[]
}

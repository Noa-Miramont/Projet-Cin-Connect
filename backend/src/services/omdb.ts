const OMDB_API_KEY = process.env.OMDB_API_KEY ?? 'c630a2cf'
const BASE = 'https://www.omdbapi.com'

export type OMDbSearchResult = {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

export type OMDbSearchResponse = {
  Search?: OMDbSearchResult[]
  totalResults?: string
  Response: string
  Error?: string
}

export type OMDbMovieResponse = {
  Title: string
  Year: string
  Rated?: string
  Released?: string
  Runtime?: string
  Genre?: string
  Director?: string
  Writer?: string
  Actors?: string
  Plot?: string
  Poster?: string
  imdbID: string
  Response: string
  Error?: string
}

export const omdbService = {
  async search(query: string, page = 1): Promise<OMDbSearchResponse> {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      s: query,
      type: 'movie',
      page: String(page)
    })
    const res = await fetch(`${BASE}/?${params}`)
    if (!res.ok) throw new Error(`OMDb API error: ${res.status}`)
    const data = (await res.json()) as OMDbSearchResponse
    if (data.Response === 'False' && data.Error) {
      throw new Error(data.Error)
    }
    return data
  },

  async getById(imdbId: string): Promise<OMDbMovieResponse | null> {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      i: imdbId
    })
    const res = await fetch(`${BASE}/?${params}`)
    if (!res.ok) throw new Error(`OMDb API error: ${res.status}`)
    const data = (await res.json()) as OMDbMovieResponse
    if (data.Response === 'False') return null
    return data
  }
}

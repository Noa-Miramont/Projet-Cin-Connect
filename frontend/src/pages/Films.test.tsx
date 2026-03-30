import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const navigateMock = vi.fn()
const invalidateQueriesMock = vi.fn()
const useQueryMock = vi.fn()
const useMutationMock = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock
  })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      username: 'alice',
      email: 'alice@test.com',
      createdAt: '2026-03-30T00:00:00.000Z'
    }
  })
}))

vi.mock('@/components/wall_of_movies/wall_of_movies', () => ({
  default: () => null
}))

import { FilmOverlayPanel } from './Films'

describe('FilmOverlayPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders reviews, watchlist action and delete action with stable logic', () => {
    useQueryMock
      .mockReturnValueOnce({
        data: {
          id: 'film-1',
          title: 'Interstellar',
          description: 'Un voyage spatial.',
          year: 2014,
          director: 'Christopher Nolan',
          poster_url: '/poster.jpg',
          averageRating: 4.2,
          reviews: [
            {
              id: 'review-1',
              user_id: 'user-1',
              film_id: 'film-1',
              rating: 5,
              comment: 'Incroyable.',
              created_at: '2026-03-30T00:00:00.000Z',
              username: 'alice'
            }
          ]
        },
        isLoading: false
      })
      .mockReturnValueOnce({
        data: [{ id: 'friend-1', friend_id: 'friend-user-1', username: 'bob' }]
      })
      .mockReturnValueOnce({
        data: [],
        isLoading: false
      })

    useMutationMock
      .mockReturnValueOnce({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null
      })
      .mockReturnValueOnce({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null
      })
      .mockReturnValueOnce({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null
      })
      .mockReturnValueOnce({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null
      })

    const html = renderToStaticMarkup(
      <FilmOverlayPanel filmId="film-1" filmTitle="Interstellar" filmPosterUrl="/poster.jpg" />
    )

    expect(html).toContain('Commentaires')
    expect(html).toContain('alice')
    expect(html).toContain('Incroyable.')
    expect(html).toContain('Ajouter à ma watchlist')
    expect(html).toContain('Voir la page du film')
    expect(html).toContain('Supprimer mon avis')
  })
})

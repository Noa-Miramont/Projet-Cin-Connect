import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useQueryMock = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: unknown }) => <a>{children}</a>,
  useParams: () => ({ category: 'action' })
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args)
}))

vi.mock('@/components/wall_of_movies/wall_of_movies', () => ({
  default: () => <div>gallery-marker</div>
}))

vi.mock('@/pages/Films', () => ({
  FilmOverlayPanel: () => <div>overlay-marker</div>
}))

import { FilmsByCategoryPage } from './FilmsByCategory'

describe('FilmsByCategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reuses the films gallery layout for category navigation', () => {
    useQueryMock
      .mockReturnValueOnce({
        data: [
          { id: 'action', name: 'Action' },
          { id: 'drama', name: 'Drame' }
        ],
        isLoading: false
      })
      .mockReturnValueOnce({
        data: {
          films: [
            {
              id: 'film-1',
              title: 'Interstellar',
              poster_url: '/poster.jpg'
            }
          ]
        },
        isLoading: false
      })

    const html = renderToStaticMarkup(<FilmsByCategoryPage />)

    expect(html).toContain('Parcourir par catégorie')
    expect(html).toContain('Action')
    expect(html).toContain('gallery-marker')
  })
})

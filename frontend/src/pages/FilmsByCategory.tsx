import { Link, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import DomeGallery from '@/components/wall_of_movies/wall_of_movies'
import { fetchCategories } from '@/services/categories'
import { fetchFilms } from '@/services/films'
import { FilmOverlayPanel } from '@/pages/Films'

export function FilmsByCategoryPage() {
  const { category: categoryId } = useParams({ from: '/films/$category' })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  const category = categories?.find((item) => item.id === categoryId)
  const isInvalidCategory = categories && categories.length > 0 && !category

  const { data, isLoading } = useQuery({
    queryKey: ['films-wall', categoryId],
    queryFn: () =>
      fetchFilms({
        page: 1,
        limit: 200,
        category: categoryId
      }),
    enabled: Boolean(categoryId)
  })

  const images = useMemo(
    () =>
      (data?.films ?? [])
        .filter((film) => Boolean(film.poster_url))
        .map((film) => ({
          id: film.id,
          src: film.poster_url as string,
          alt: film.title,
          title: film.title
        })),
    [data]
  )

  if (isInvalidCategory) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black px-4">
        <div className="text-center">
          <p className="text-zinc-400">Catégorie introuvable.</p>
          <Link to="/films" className="mt-4 inline-block text-zinc-200 hover:underline">
            Retour aux films
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="text-zinc-400">Chargement des films…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <section className="shrink-0 border-b border-zinc-800 bg-zinc-950/70 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
            <Link to="/" className="transition hover:text-white">
              Accueil
            </Link>
            <span>/</span>
            <Link to="/films" className="transition hover:text-white">
              Films
            </Link>
            <span>/</span>
            <span className="text-zinc-200">{category?.name ?? '...'}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-zinc-300">Parcourir par catégorie</h2>
            <p className="text-xs uppercase tracking-[0.14em] text-sky-300">
              {category?.name ?? 'Films'}
            </p>
          </div>

          {categoriesLoading ? (
            <div className="flex gap-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-10 w-20 animate-pulse rounded-none bg-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link
                to="/films"
                className="rounded-none border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500/60 hover:text-white"
              >
                Tous
              </Link>
              {(categories ?? []).map((item) => (
                <Link
                  key={item.id}
                  to="/films/$category"
                  params={{ category: item.id }}
                  className={`rounded-none border px-4 py-2 text-sm transition ${
                    categoryId === item.id
                      ? 'border-zinc-500/60 bg-zinc-100/10 text-white'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-500/60 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="min-h-0 flex-1">
        <DomeGallery
          images={images}
          fit={1}
          minRadius={700}
          maxVerticalRotationDeg={20}
          segments={30}
          dragDampening={5}
          grayscale={false}
          openedImageWidth="min(70vw, 420px)"
          openedImageHeight="min(70vh, 630px)"
          onOpen={(item) => {
            if (!item.id) return
          }}
          onClose={() => {}}
          overlayContent={(item) => {
            if (!item.id) return null
            return (
              <FilmOverlayPanel
                filmId={item.id}
                filmTitle={item.title || item.alt}
                filmPosterUrl={item.src}
              />
            )
          }}
        />
      </div>
    </div>
  )
}

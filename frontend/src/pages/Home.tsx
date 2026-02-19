import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFilms } from '@/services/films'
import { fetchCategories } from '@/services/categories'
import { FilmCard } from '@/components/FilmCard'

export function HomePage() {
  const { data: filmsData, isLoading: filmsLoading } = useQuery({
    queryKey: ['films', { limit: 10, sort: 'popular' }],
    queryFn: () => fetchFilms({ limit: 10, sort: 'year' })
  })
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  return (
    <div>
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            CinéConnect
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
            Découvrez des films, partagez vos avis et discutez en temps réel avec vos amis.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/films"
              className="rounded bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-500"
            >
              Explorer les films
            </Link>
            <Link
              to="/films"
              className="rounded border border-slate-600 px-6 py-3 font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Par catégorie
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold text-white">Films populaires</h2>
        {filmsLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-lg bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {(filmsData?.films ?? []).map((film) => (
              <div key={film.id} className="w-40 flex-shrink-0">
                <FilmCard film={film} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold text-white">Parcourir par catégorie</h2>
        {categoriesLoading ? (
          <div className="mt-6 flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 animate-pulse rounded-lg bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            {(categories ?? []).map((cat) => (
              <Link
                key={cat.id}
                to="/films/$category"
                params={{ category: cat.id }}
                className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-300 transition hover:border-amber-600/50 hover:text-white"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

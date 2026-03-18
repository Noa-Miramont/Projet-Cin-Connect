import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFilms } from '@/services/films'
import { fetchCategories } from '@/services/categories'
import { FilmCard } from '@/components/FilmCard'

export function FilmsByCategoryPage() {
  const { category: categoryId } = useParams({ from: '/films/$category' })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  const category = categories?.find((c) => c.id === categoryId)
  const isInvalidCategory = categories && categories.length > 0 && !category

  const { data, isLoading } = useQuery({
    queryKey: ['films', { category: categoryId }],
    queryFn: () => fetchFilms({ category: categoryId }),
    enabled: !!categoryId
  })

  if (isInvalidCategory) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-zinc-400">Catégorie introuvable.</p>
        <Link to="/films" className="mt-4 inline-block text-zinc-200 hover:underline">
          Retour aux films
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-zinc-400">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/films" className="hover:text-white">Films</Link>
        <span>/</span>
        <span className="text-white">{category?.name ?? '…'}</span>
      </nav>
      <h1 className="mt-4 text-2xl font-bold text-white">
        {category?.name ?? 'Films'}
      </h1>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-lg bg-zinc-900"
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(data?.films ?? []).map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      )}
    </div>
  )
}

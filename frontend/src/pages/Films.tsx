import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFilms } from '@/services/films'
import { fetchCategories } from '@/services/categories'
import { FilmCard } from '@/components/FilmCard'

const PER_PAGE = 12

export function FilmsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [year, setYear] = useState('')
  const [rating, setRating] = useState('')
  const [sort, setSort] = useState('year')

  const { data, isLoading } = useQuery({
    queryKey: [
      'films',
      { page, search: search || undefined, category: category || undefined, year: year ? Number(year) : undefined, rating: rating ? Number(rating) : undefined, sort }
    ],
    queryFn: () =>
      fetchFilms({
        page,
        limit: PER_PAGE,
        search: search || undefined,
        category: category || undefined,
        year: year ? Number(year) : undefined,
        rating: rating ? Number(rating) : undefined,
        sort: sort || undefined
      })
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Films</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Rechercher par titre…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          >
            <option value="">Toutes catégories</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Année"
            value={year}
            onChange={(e) => {
              setYear(e.target.value)
              setPage(1)
            }}
            className="w-24 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value)
              setPage(1)
            }}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          >
            <option value="">Note min.</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          >
            <option value="year">Année (récent)</option>
            <option value="title">Titre</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-lg bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {(data?.films ?? []).map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-slate-700 px-4 py-2 text-slate-300 disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="flex items-center px-4 text-slate-400">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-slate-700 px-4 py-2 text-slate-300 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

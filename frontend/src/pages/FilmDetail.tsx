import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchFilm } from '@/services/films'
import { createReview } from '@/services/reviews'
import { useAuth } from '@/contexts/AuthContext'

export function FilmDetailPage() {
  const { id } = useParams({ from: '/film/$id' })
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')

  const { data: film, isLoading, error } = useQuery({
    queryKey: ['film', id],
    queryFn: () => fetchFilm(id)
  })

  const createReviewMutation = useMutation({
    mutationFn: () =>
      createReview({ filmId: id, rating, comment: comment || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film', id] })
      setComment('')
      setRating(3)
    }
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-lg bg-zinc-900" />
      </div>
    )
  }

  if (error || !film) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-zinc-400">Film non trouvé.</p>
        <Link to="/films" className="mt-4 inline-block text-zinc-200 hover:underline">
          Retour aux films
        </Link>
      </div>
    )
  }

  const reviews = film.reviews ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900">
            {film.poster_url ? (
              <img
                src={film.poster_url}
                alt={film.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Affiche indisponible
              </div>
            )}
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">{film.title}</h1>
            {film.director && (
              <p className="mt-1 text-zinc-400">Réal. {film.director}</p>
            )}
            {film.year != null && (
              <p className="text-zinc-400">{film.year}</p>
            )}
            {film.averageRating != null && (
              <p className="mt-2 text-zinc-300">
                Note moyenne : {film.averageRating.toFixed(1)} / 5
              </p>
            )}
          </div>
        </div>

        <div>
          {film.description && (
            <p className="text-zinc-300">{film.description}</p>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white">Avis</h2>
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{r.username}</span>
                    <span className="text-zinc-200">{r.rating}/5</span>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-zinc-400">{r.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {user && (
            <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="font-medium text-white">Ajouter un avis</h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Note :</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Votre avis (optionnel)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={() => createReviewMutation.mutate()}
                  disabled={createReviewMutation.isPending}
                  className="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
                >
                  {createReviewMutation.isPending ? 'Envoi…' : 'Publier'}
                </button>
                {createReviewMutation.isError && (
                  <p className="text-sm text-red-400">
                    {(createReviewMutation.error as Error).message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link
              to="/discussion"
              className="inline-block rounded border border-zinc-700 px-4 py-2 text-zinc-300 hover:border-zinc-500/60 hover:text-white"
            >
              Discuter de ce film
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchFilm } from '@/services/films'
import { createReview, replaceReview } from '@/services/reviews'
import { fetchFriends } from '@/services/friends'
import { useAuth } from '@/contexts/AuthContext'

export function FilmDetailPage() {
  const { id } = useParams({ from: '/film/$id' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [createErrorStatus, setCreateErrorStatus] = useState<number | null>(null)
  const [shareFriendId, setShareFriendId] = useState<string | null>(null)
  const [shareComment, setShareComment] = useState('')

  const { data: film, isLoading, error } = useQuery({
    queryKey: ['film', id],
    queryFn: () => fetchFilm(id)
  })

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: fetchFriends,
    enabled: !!user
  })

  const createReviewMutation = useMutation({
    mutationFn: () =>
      createReview({
        filmId: id,
        rating,
        comment: comment.trim() ? comment.trim() : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film', id] })
      setComment('')
      setRating(0)
      setCreateErrorStatus(null)
    },
    onError: (err) => {
      const status = (err as any)?.response?.status as number | undefined
      setCreateErrorStatus(status ?? null)
      if (status === 409) setReplaceOpen(true)
    }
  })

  const updateReviewMutation = useMutation({
    mutationFn: () =>
      replaceReview({
        filmId: id,
        rating,
        comment: comment.trim() ? comment.trim() : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film', id] })
      setComment('')
      setRating(0)
      setReplaceOpen(false)
      setCreateErrorStatus(null)
    }
  })

  function shareToDm() {
    if (!shareFriendId || !film) return
    const base = `Je te partage le film "${film.title}"`
    const extra = shareComment.trim() ? `\n\nMon message: ${shareComment.trim()}` : ''
    const content = `${base}${extra}`
    sessionStorage.setItem(
      'dollyzoom_dm_draft',
      JSON.stringify({ friendId: shareFriendId, content })
    )
    navigate({ to: '/discussion' })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#131313] px-4 py-8 md:px-8">
        <div className="mx-auto h-96 max-w-7xl animate-pulse rounded-xl bg-zinc-900" />
      </div>
    )
  }

  if (error || !film) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#131313] px-4 py-12 text-center">
        <p className="text-zinc-400">Film non trouve.</p>
        <Link to="/films" className="mt-4 inline-block text-zinc-200 hover:underline">
          Retour aux films
        </Link>
      </div>
    )
  }

  const reviews = film.reviews ?? []
  const backdropImage =
    film.poster_url ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1920&auto=format&fit=crop'
  const averageLabel = film.averageRating != null ? film.averageRating.toFixed(1) : 'N/A'
  const ratingStars = useMemo(() => {
    const avg = film.averageRating ?? 0
    const full = Math.round(avg)
    return Array.from({ length: 5 }, (_, i) => i < full)
  }, [film.averageRating])

  return (
    <>
      <main className="min-h-[calc(100vh-80px)] bg-[#131313] pb-20 text-[#e2e2e2]">
        <section className="relative h-[50vh] min-h-[320px] max-h-[520px] w-full overflow-hidden md:h-[56vh]">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#131313] via-[#131313]/20 to-transparent" />
          <img src={backdropImage} alt={film.title} className="h-full w-full scale-105 object-cover" />
          <div className="absolute bottom-0 left-0 z-20 w-full p-6 md:p-12">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded bg-[#009dff] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#003257]">
                Film
              </span>
              {film.year != null ? (
                <span className="text-sm font-medium text-[#bfc7d4]">{film.year}</span>
              ) : null}
            </div>
            <h1 className="max-w-4xl text-5xl font-black uppercase tracking-tight md:text-7xl">
              {film.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#89919e]">Realisateur</p>
                <p className="text-lg font-bold">{film.director || 'Inconnu'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#89919e]">Note moyenne</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#9dcaff]">{averageLabel}</span>
                  <div className="flex gap-1">
                    {ratingStars.map((filled, idx) => (
                      <span
                        key={idx}
                        className={`h-2.5 w-2.5 rounded-full ${filled ? 'bg-[#009dff]' : 'bg-[#3f4752]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Link
                to="/films"
                className="rounded-md border border-[#009dff]/40 bg-[#009dff]/10 px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#9dcaff] transition hover:border-[#009dff] hover:text-white"
              >
                Retour aux films
              </Link>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 px-4 py-12 md:px-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="mb-10 rounded-xl border border-white/5 bg-[#1b1b1b] p-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Description <span className="text-[#009dff]">du film</span>
              </h2>
              <p className="mt-4 leading-relaxed text-[#bfc7d4]">
                {film.description || 'Aucune description disponible pour ce film.'}
              </p>
            </div>

            <section className="mb-10 rounded-xl border border-white/5 bg-[#1b1b1b] p-6">
              <h3 className="text-xl font-black uppercase tracking-widest text-[#9dcaff]">
                Noter ce film
              </h3>
              {user ? (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={`rounded-md border px-4 py-2 text-sm font-bold transition ${
                          n <= rating
                            ? 'border-[#009dff] bg-[#009dff]/15 text-[#9dcaff]'
                            : 'border-[#3f4752] bg-[#131313] text-[#89919e] hover:border-[#009dff]/60'
                        }`}
                      >
                        {n} etoile{n > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Partage ton avis..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-white/10 bg-[#0e0e0e] p-3 text-sm text-[#e2e2e2] outline-none transition focus:border-[#009dff]"
                  />
                  <button
                    type="button"
                    onClick={() => createReviewMutation.mutate()}
                    disabled={createReviewMutation.isPending || rating === 0}
                    className="rounded-md bg-[#009dff] px-8 py-3 text-sm font-bold uppercase tracking-widest text-[#003257] transition hover:brightness-110 disabled:opacity-50"
                  >
                    {createReviewMutation.isPending ? 'Publication...' : 'Publier'}
                  </button>
                  {createReviewMutation.isError && createErrorStatus !== 409 ? (
                    <p className="text-sm text-red-400">
                      {(createReviewMutation.error as any)?.response?.data?.error ??
                        (createReviewMutation.error as Error).message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#89919e]">Connecte-toi pour poster un avis.</p>
              )}
            </section>

            <section className="rounded-xl border border-white/5 bg-[#1b1b1b] p-6">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Avis <span className="text-[#9dcaff]">de la communaute</span>
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest text-[#009dff]">
                  Recents
                </span>
              </div>
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-sm text-[#89919e]">Aucun avis pour le moment.</p>
                ) : (
                  reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-lg border border-white/5 bg-[#131313] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-bold text-white">{review.username}</p>
                        <span className="text-xs uppercase tracking-widest text-[#89919e]">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="mb-2 text-sm font-semibold text-[#9dcaff]">{review.rating}/5</p>
                      <p className="text-sm leading-relaxed text-[#c8c6c9]">
                        {review.comment || 'Pas de commentaire'}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="mb-8 overflow-hidden rounded-xl border border-[#009dff]/30 bg-[#2a2a2a]">
              <img
                src={film.poster_url || backdropImage}
                alt={film.title}
                className="h-[320px] w-full object-cover md:h-[380px]"
              />
            </div>

            <div className="rounded-xl border border-[#009dff]/20 bg-[#2a2a2a] p-6 shadow-[0_0_40px_rgba(0,157,255,0.08)]">
              <h3 className="mb-4 border-b border-white/10 pb-3 text-sm font-black uppercase tracking-widest text-[#009dff]">
                Partage en message direct
              </h3>
              {user ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#89919e]">
                      Choisir un ami
                    </label>
                    <select
                      value={shareFriendId ?? ''}
                      onChange={(e) => setShareFriendId(e.target.value || null)}
                      className="w-full rounded-md border border-white/10 bg-[#131313] px-3 py-2 text-sm text-[#e2e2e2] outline-none focus:border-[#009dff]"
                    >
                      <option value="">Selectionner un ami</option>
                      {(friends ?? []).map((friend) => (
                        <option key={friend.id} value={friend.friend_id}>
                          {friend.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#89919e]">
                      Message perso
                    </label>
                    <textarea
                      value={shareComment}
                      onChange={(e) => setShareComment(e.target.value)}
                      rows={3}
                      placeholder="Check ce film..."
                      className="w-full rounded-md border border-white/10 bg-[#131313] p-3 text-sm text-[#e2e2e2] outline-none focus:border-[#009dff]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={shareToDm}
                    disabled={!shareFriendId}
                    className="w-full rounded-md bg-[#009dff] py-3 text-sm font-bold uppercase tracking-widest text-[#003257] transition hover:brightness-110 disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#89919e]">Connecte-toi pour partager ce film.</p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {replaceOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-none border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-center text-2xl font-semibold text-white">
              Vous avez deja note ce film
            </h3>
            <p className="mt-3 text-center text-sm text-zinc-300">
              Si vous envoyez une nouvelle note, votre ancienne note sera remplacee par la nouvelle
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => updateReviewMutation.mutate()}
                disabled={updateReviewMutation.isPending}
                className="flex-1 rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
              >
                {updateReviewMutation.isPending ? 'Remplacement...' : 'Remplacer ma note'}
              </button>
              <button
                type="button"
                onClick={() => setReplaceOpen(false)}
                disabled={updateReviewMutation.isPending}
                className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500/60 hover:text-white disabled:opacity-50"
              >
                Annuler
              </button>
            </div>

            {updateReviewMutation.isError ? (
              <p className="mt-4 text-center text-sm text-red-400">
                {(updateReviewMutation.error as any)?.response?.data?.error ??
                  (updateReviewMutation.error as Error).message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

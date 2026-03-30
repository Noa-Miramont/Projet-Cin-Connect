import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { fetchFilm, fetchFilms, type FilmDetail } from '@/services/films'
import { fetchCategories } from '@/services/categories'
import { createReview, deleteReview, replaceReview } from '@/services/reviews'
import { fetchFriends } from '@/services/friends'
import { addFilmToWatchlist } from '@/services/watchlist'
import { useAuth } from '@/contexts/AuthContext'
import DomeGallery from '@/components/wall_of_movies/wall_of_movies'

function StarRating({
  value,
  onChange,
  disabled
}: {
  value: number
  onChange: (next: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition ${
            disabled ? 'opacity-50' : 'hover:scale-110'
          } ${n <= value ? 'text-zinc-100' : 'text-zinc-700'}`}
          aria-label={`Mettre ${n} étoile${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function FilmOverlayPanel({
  filmId,
  filmTitle,
  filmPosterUrl
}: {
  filmId: string
  filmTitle: string
  filmPosterUrl?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [createErrorStatus, setCreateErrorStatus] = useState<number | null>(null)
  const [shareFriendId, setShareFriendId] = useState<string | null>(null)
  const [shareComment, setShareComment] = useState('')

  const { data: film, isLoading } = useQuery({
    queryKey: ['film', filmId],
    queryFn: () => fetchFilm(filmId),
    enabled: Boolean(filmId)
  })

  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends,
    enabled: Boolean(user)
  })

  const createReviewMutation = useMutation({
    mutationFn: () =>
      createReview({
        filmId,
        rating,
        comment: comment.trim() ? comment.trim() : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film', filmId] })
      setComment('')
      setRating(0)
      setCreateErrorStatus(null)
    },
    onError: (err) => {
      const status = (err as any)?.response?.status as number | undefined
      setCreateErrorStatus(status ?? null)
      if (status === 409) {
        setReplaceOpen(true)
      }
    }
  })

  const updateReviewMutation = useMutation({
    mutationFn: () =>
      replaceReview({
        filmId,
        rating,
        comment: comment.trim() ? comment.trim() : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film', filmId] })
      setComment('')
      setRating(0)
      setReplaceOpen(false)
      setCreateErrorStatus(null)
    }
  })

  const deleteReviewMutation = useMutation({
    mutationFn: () => deleteReview(filmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film', filmId] })
      setComment('')
      setRating(0)
      setDeleteOpen(false)
      setReplaceOpen(false)
      setCreateErrorStatus(null)
    }
  })

  const resolvedFilm: FilmDetail | null | undefined = film
  const reviews = resolvedFilm?.reviews ?? []
  const averageRating = resolvedFilm?.averageRating
  const myReview = user ? reviews.find((review) => review.user_id === user.id) : undefined

  function addToWatchlist() {
    if (!user) return
    addFilmToWatchlist(user.id, {
      id: filmId,
      title: filmTitle,
      posterUrl: filmPosterUrl ?? resolvedFilm?.poster_url ?? ''
    })
  }

  function shareToDm() {
    if (!shareFriendId) return
    const base = `Je te partage le film "${filmTitle}"`
    const extra = shareComment.trim() ? `\n\nMon message: ${shareComment.trim()}` : ''
    const content = `${base}${extra}`
    sessionStorage.setItem(
      'cineconnect_dm_draft',
      JSON.stringify({ friendId: shareFriendId, content })
    )
    navigate({ to: '/discussion' })
  }

  return (
    <div className="mx-auto w-full max-w-9xl">
      <div className="max-h-[calc(100vh-220px)] w-full overflow-y-auto pr-1 md:max-h-none md:overflow-visible">
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="w-full rounded-non border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur md:w-[440px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Commentaires</h3>
          {averageRating != null ? (
            <div className="text-sm text-zinc-300">=
              Note moyenne: {averageRating.toFixed(1)} / 5
            </div>
          ) : (
            <div className="text-sm text-zinc-400">Aucune note pour l’instant</div>
          )}
        </div>
        {user ? (
          <button
            type="button"
            onClick={addToWatchlist}
            className="mt-3 w-full rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/70 hover:text-white"
          >
            Ajouter à ma watchlist
          </button>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">Connectez-vous pour utiliser la watchlist</p>
        )}

        {isLoading ? (
          <div className="mt-4 space-y-3">
            <div className="h-16 animate-pulse rounded-none bg-zinc-800/60" />
            <div className="h-16 animate-pulse rounded-none bg-zinc-800/60" />
          </div>
        ) : (
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <li className="text-sm text-zinc-400">Soyez le premier à commenter</li>
            ) : (
              reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-none border border-zinc-800 bg-zinc-900/50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{r.username}</span>
                    <span className="text-sm text-zinc-200">{r.rating}/5</span>
                  </div>
                  {r.comment ? (
                    <p className="mt-2 text-sm text-zinc-300">{r.comment}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

          <div className="hidden md:block md:w-[420px] md:shrink-0" />

          <div className="w-full rounded-none border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur md:w-[440px]">
        <h3 className="text-base font-semibold text-white">Votre avis</h3>
        {user ? (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-300">Note</span>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ajouter un commentaire (optionnel)"
              className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={() => createReviewMutation.mutate()}
              disabled={createReviewMutation.isPending || rating === 0}
              className="w-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white disabled:opacity-50"
            >
              {createReviewMutation.isPending ? 'Envoi…' : 'Publier'}
            </button>
            {myReview ? (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleteReviewMutation.isPending}
                className="mt-2 w-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500/60 hover:text-white disabled:opacity-50"
              >
                {deleteReviewMutation.isPending ? 'Suppression…' : 'Supprimer mon avis'}
              </button>
            ) : null}
            {createReviewMutation.isError && createErrorStatus !== 409 ? (
              <p className="text-sm text-red-400">
                {(createReviewMutation.error as any)?.response?.data?.error ??
                  (createReviewMutation.error as Error).message}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">Connectez-vous pour noter et commenter</p>
        )}

        <div className="mt-5 border-t border-zinc-800 pt-4">
          <h3 className="text-base font-semibold text-white">Partager en DM</h3>
          {user ? (
            <div className="mt-3 space-y-3">
              <select
                value={shareFriendId ?? ''}
                onChange={(e) => setShareFriendId(e.target.value || null)}
                className="w-full rounded-none border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
              >
                <option value="">Choisir un ami</option>
                {(friends ?? []).map((f) => (
                  <option key={f.id} value={f.friend_id}>
                    {f.username}
                  </option>
                ))}
              </select>
              <textarea
                value={shareComment}
                onChange={(e) => setShareComment(e.target.value)}
                rows={2}
                placeholder="Ajouter un commentaire pour votre ami (optionnel)"
                className="w-full rounded-none border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={shareToDm}
                disabled={!shareFriendId}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-500/60 hover:text-white disabled:opacity-50"
              >
                Partager
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">Connectez-vous pour partager en DM</p>
          )}
        </div>
      </div>
        </div>
      </div>
      {replaceOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-none border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-center text-2xl font-semibold text-white">
              Vous avez déjà noté ce film
            </h3>
            <p className="mt-3 text-center text-sm text-zinc-300">
              Si vous envoyez une nouvelle note, votre ancienne note sera remplacée
              par la nouvelle.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => updateReviewMutation.mutate()}
                disabled={updateReviewMutation.isPending}
                className="flex-1 rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
              >
                {updateReviewMutation.isPending
                  ? 'Remplacement…'
                  : 'Remplacer ma note'}
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
      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-none border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-center text-2xl font-semibold text-white">
              Supprimer votre avis
            </h3>
            <p className="mt-3 text-center text-sm text-zinc-300">
              Êtes-vous sûr de vouloir supprimer votre avis ?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => deleteReviewMutation.mutate()}
                disabled={deleteReviewMutation.isPending}
                className="flex-1 rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
              >
                {deleteReviewMutation.isPending ? 'Suppression…' : 'Supprimer'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleteReviewMutation.isPending}
                className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500/60 hover:text-white disabled:opacity-50"
              >
                Annuler
              </button>
            </div>

            {deleteReviewMutation.isError ? (
              <p className="mt-4 text-center text-sm text-red-400">
                {(deleteReviewMutation.error as any)?.response?.data?.error ??
                  (deleteReviewMutation.error as Error).message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FilmsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  const { data, isLoading } = useQuery({
    queryKey: ['films-wall', selectedCategoryId],
    queryFn: () =>
      fetchFilms({
        page: 1,
        limit: 200,
        ...(selectedCategoryId ? { category: selectedCategoryId } : {})
      })
  })

  const images = useMemo(
    () =>
      (data?.films ?? [])
        .filter(film => Boolean(film.poster_url))
        .map(film => ({
          id: film.id,
          src: film.poster_url as string,
          alt: film.title,
          title: film.title
        })),
    [data]
  )

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="text-zinc-400">Chargement des films…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <section className="shrink-0 border-b border-zinc-800 bg-zinc-950/70 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-300">Parcourir par catégorie</h2>
          {categoriesLoading ? (
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-20 animate-pulse rounded-none bg-zinc-800"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={`rounded-none border px-4 py-2 text-sm transition ${
                  selectedCategoryId === null
                    ? 'border-zinc-500/60 bg-zinc-100/10 text-white'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-500/60 hover:text-white'
                }`}
              >
                Tous
              </button>
              {(categories ?? []).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`rounded-none border px-4 py-2 text-sm transition ${
                    selectedCategoryId === cat.id
                      ? 'border-zinc-500/60 bg-zinc-100/10 text-white'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-500/60 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
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

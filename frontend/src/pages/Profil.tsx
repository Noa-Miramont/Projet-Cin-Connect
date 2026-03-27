import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import { fetchMyReviews } from '@/services/users'
import {
  fetchFriends,
  addFriend,
  removeFriend,
  acceptFriendRequest,
  declineFriendRequest
} from '@/services/friends'

export function ProfilPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [friendUsername, setFriendUsername] = useState('')
  const {
    friendRequests,
    isLoadingFriendRequests,
    hasFriendRequestsError,
    friendRequestsError,
    refreshFriendRequests
  } = useNotifications()

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
    }
  }, [user, navigate])

  const {
    data: reviews,
    isLoading: reviewsLoading,
    isError: hasReviewsError,
    error: reviewsError
  } = useQuery({
    queryKey: ['users', 'me', 'reviews', user?.id],
    queryFn: fetchMyReviews,
    enabled: !!user,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  })

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: fetchFriends,
    enabled: !!user,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  })

  const addFriendMutation = useMutation({
    mutationFn: addFriend,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['friends'] }),
        queryClient.invalidateQueries({
          queryKey: ['friends', 'requests', 'received', user?.id]
        }),
        refreshFriendRequests()
      ])
      setFriendUsername('')
    }
  })

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['friends'] })
    }
  })

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['friends'] }),
        queryClient.invalidateQueries({
          queryKey: ['friends', 'requests', 'received', user?.id]
        }),
        refreshFriendRequests()
      ])
    }
  })

  const declineMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['friends', 'requests', 'received', user?.id]
        }),
        refreshFriendRequests()
      ])
    }
  })

  useEffect(() => {
    if (!user) return
    void queryClient.invalidateQueries({
      queryKey: ['users', 'me', 'reviews', user.id]
    })
    void refreshFriendRequests()
  }, [queryClient, refreshFriendRequests, user])

  if (!user) {
    return null
  }

  const addFriendErrorMessage =
    addFriendMutation.isError && isAxiosError(addFriendMutation.error)
      ? (addFriendMutation.error.response?.data as { error?: string } | undefined)
          ?.error ?? addFriendMutation.error.message
      : addFriendMutation.isError
        ? (addFriendMutation.error as Error).message
        : null

  const reviewsErrorMessage =
    hasReviewsError && reviewsError instanceof Error
      ? reviewsError.message
      : null

  const totalReviews = reviews?.length ?? 0
  const totalFriends = friends?.length ?? 0
  const averageRating = totalReviews
    ? (
        (reviews ?? []).reduce((sum, review) => {
          return sum + review.rating
        }, 0) / totalReviews
      ).toFixed(1)
    : '0.0'

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-zinc-950 px-4 py-8 text-zinc-100 md:px-8">
      <div className="pointer-events-none absolute -top-20 left-10 h-56 w-56 rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-300/10 blur-[140px]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/50">
          <div className="h-40 w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
          <div className="flex flex-col gap-6 px-6 pb-6 -mt-12 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-2xl font-black uppercase text-sky-300">
                  {user.username.slice(0, 2)}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">
                    {user.username}
                  </h1>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-sky-400/50 hover:text-sky-200"
              >
                Déconnexion
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Avis publiés
                </p>
                <p className="mt-2 text-2xl font-black text-sky-300">{totalReviews}</p>
              </article>
              <article className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Amis
                </p>
                <p className="mt-2 text-2xl font-black text-sky-300">{totalFriends}</p>
              </article>
              <article className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Note moyenne
                </p>
                <p className="mt-2 text-2xl font-black text-sky-300">{averageRating}/5</p>
              </article>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <section className="xl:col-span-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black uppercase tracking-tight">Mes avis</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Collection personnelle
              </span>
            </div>
            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4 md:p-5">
        {reviewsLoading ? (
                <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                    className="h-20 animate-pulse rounded-xl bg-zinc-900"
              />
            ))}
          </div>
        ) : reviewsErrorMessage ? (
                <p className="text-sm text-red-400">
            Impossible de charger les avis: {reviewsErrorMessage}
          </p>
        ) : (reviews?.length ?? 0) === 0 ? (
                <p className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
                  Tu n’as pas encore publié d’avis
                </p>
        ) : (
                <ul className="space-y-3">
            {(reviews ?? []).map((r) => (
              <li
                key={r.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                  <Link
                    to="/film/$id"
                    params={{ id: r.film_id }}
                          className="font-semibold text-zinc-100 transition hover:text-sky-200"
                  >
                    {r.film_title}
                  </Link>
                        <p className="mt-1 text-sm text-zinc-400">{r.rating}/5</p>
                      </div>
                <Link
                  to="/film/$id"
                  params={{ id: r.film_id }}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-sky-400/40 hover:text-sky-200"
                >
                  Voir le film
                </Link>
                    </div>
              </li>
            ))}
          </ul>
        )}
            </div>
      </section>

          <section className="xl:col-span-4">
            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-zinc-200">
                  Demandes reçues
                </h2>
          <button
            type="button"
            onClick={() => {
              void refreshFriendRequests()
            }}
                  className="rounded-md border border-zinc-700 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-300 transition hover:border-sky-400/40 hover:text-sky-200"
          >
            Actualiser
          </button>
              </div>
        {isLoadingFriendRequests ? (
                <div className="mt-4 space-y-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                    className="h-14 animate-pulse rounded-xl bg-zinc-900"
              />
            ))}
          </div>
        ) : hasFriendRequestsError ? (
          <p className="mt-4 text-sm text-red-400">
            Erreur chargement demandes:{' '}
            {friendRequestsError instanceof Error
              ? friendRequestsError.message
              : 'inconnue'}
          </p>
        ) : friendRequests.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
                  Aucune demande reçue
                </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {friendRequests.map((request) => (
              <li
                key={request.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                    <p className="text-sm font-semibold text-zinc-100">{request.username}</p>
                    <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => acceptMutation.mutate(request.id)}
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                        className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => declineMutation.mutate(request.id)}
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                        className="rounded-md bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-rose-500 disabled:opacity-50"
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase tracking-tight">Mes amis</h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              Social
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Pseudo pour envoyer une demande"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addFriendMutation.mutate(friendUsername)
            }}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-sky-400/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => addFriendMutation.mutate(friendUsername)}
            disabled={addFriendMutation.isPending || !friendUsername.trim()}
              className="rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"
          >
            Envoyer
          </button>
          </div>
        {addFriendMutation.isError && (
          <p className="mt-2 text-sm text-red-400">
            {addFriendErrorMessage}
          </p>
        )}
        {friendsLoading ? (
            <div className="mt-4 space-y-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                  className="h-14 animate-pulse rounded-xl bg-zinc-900"
              />
            ))}
          </div>
        ) : (
            <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {(friends ?? []).map((f) => (
              <li
                key={f.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3"
              >
                  <span className="font-medium text-zinc-100">{f.username}</span>
                <button
                  type="button"
                  onClick={() => removeFriendMutation.mutate(f.id)}
                  disabled={removeFriendMutation.isPending}
                    className="text-sm text-rose-400 transition hover:text-rose-300 disabled:opacity-50"
                >
                  Retirer
                </button>
              </li>
            ))}
              {(friends?.length ?? 0) === 0 && (
                <li className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-center text-sm text-zinc-500 md:col-span-2">
                  Aucun ami pour le moment
                </li>
              )}
          </ul>
        )}
        </section>
      </div>
    </div>
  )
}

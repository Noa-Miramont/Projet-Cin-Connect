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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Mon profil</h1>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
        >
          Déconnexion
        </button>
      </div>

      <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Informations</h2>
        <p className="mt-2 text-zinc-300">Pseudo : {user.username}</p>
        <p className="text-zinc-300">Email : {user.email}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Mes avis</h2>
        {reviewsLoading ? (
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-zinc-900"
              />
            ))}
          </div>
        ) : reviewsErrorMessage ? (
          <p className="mt-4 text-sm text-red-400">
            Impossible de charger les avis: {reviewsErrorMessage}
          </p>
        ) : (reviews?.length ?? 0) === 0 ? (
          <p className="mt-4 text-zinc-400">Tu n’as pas encore publié d’avis</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {(reviews ?? []).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div>
                  <Link
                    to="/film/$id"
                    params={{ id: r.film_id }}
                    className="font-medium text-zinc-200 hover:underline"
                  >
                    {r.film_title}
                  </Link>
                  <span className="ml-2 text-zinc-300">{r.rating}/5</span>
                </div>
                <Link
                  to="/film/$id"
                  params={{ id: r.film_id }}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  Voir le film
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Demandes d’amis reçues</h2>
          <button
            type="button"
            onClick={() => {
              void refreshFriendRequests()
            }}
            className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
          >
            Actualiser
          </button>
        </div>
        {isLoadingFriendRequests ? (
          <div className="mt-4 space-y-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-zinc-900"
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
          <p className="mt-4 text-zinc-400">Aucune demande reçue</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {friendRequests.map((request) => (
              <li
                key={request.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <p className="text-sm font-medium text-white">{request.username}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => acceptMutation.mutate(request.id)}
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                    className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => declineMutation.mutate(request.id)}
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                    className="rounded bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-500 disabled:opacity-50"
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Mes amis</h2>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Pseudo pour envoyer une demande"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addFriendMutation.mutate(friendUsername)
            }}
            className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          />
          <button
            type="button"
            onClick={() => addFriendMutation.mutate(friendUsername)}
            disabled={addFriendMutation.isPending || !friendUsername.trim()}
            className="rounded bg-zinc-100 px-4 py-2 text-zinc-950 hover:bg-white disabled:opacity-50"
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
                className="h-12 animate-pulse rounded-lg bg-zinc-900"
              />
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {(friends ?? []).map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <span className="font-medium text-white">{f.username}</span>
                <button
                  type="button"
                  onClick={() => removeFriendMutation.mutate(f.id)}
                  disabled={removeFriendMutation.isPending}
                  className="text-sm text-red-400 hover:underline disabled:opacity-50"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

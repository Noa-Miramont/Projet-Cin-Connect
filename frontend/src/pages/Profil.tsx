import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { fetchMyReviews } from '@/services/users'
import { fetchFriends, addFriend, removeFriend } from '@/services/friends'

export function ProfilPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [friendUsername, setFriendUsername] = useState('')

  if (!user) {
    navigate({ to: '/login' })
    return null
  }

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['users', 'me', 'reviews'],
    queryFn: fetchMyReviews
  })

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends
  })

  const addFriendMutation = useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      setFriendUsername('')
    }
  })

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    }
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Mon profil</h1>

      <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Informations</h2>
        <p className="mt-2 text-slate-300">Pseudo : {user.username}</p>
        <p className="text-slate-300">Email : {user.email}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Mes avis</h2>
        {reviewsLoading ? (
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {(reviews ?? []).map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4"
              >
                <div>
                  <Link
                    to="/film/$id"
                    params={{ id: r.film_id }}
                    className="font-medium text-amber-400 hover:underline"
                  >
                    {r.film_title}
                  </Link>
                  <span className="ml-2 text-amber-400">{r.rating}/5</span>
                </div>
                <Link
                  to="/film/$id"
                  params={{ id: r.film_id }}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Voir le film
                </Link>
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
            placeholder="Pseudo à ajouter"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addFriendMutation.mutate(friendUsername)
            }}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
          <button
            type="button"
            onClick={() => addFriendMutation.mutate(friendUsername)}
            disabled={addFriendMutation.isPending || !friendUsername.trim()}
            className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-500 disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
        {addFriendMutation.isError && (
          <p className="mt-2 text-sm text-red-400">
            {(addFriendMutation.error as Error).message}
          </p>
        )}
        {friendsLoading ? (
          <div className="mt-4 space-y-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {(friends ?? []).map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3"
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

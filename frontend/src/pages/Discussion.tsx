import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriends
} from '@/services/friends'
import { fetchConversation } from '@/services/messages'
import { getWatchlist, type WatchlistFilm } from '@/services/watchlist'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function DiscussionPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const {
    friendRequests,
    hasFriendRequestsError,
    friendRequestsError,
    refreshFriendRequests
  } = useNotifications()
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<'messages' | 'watchlist'>('messages')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistFilm[]>([])
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const draftConsumedRef = useRef(false)

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    if (draftConsumedRef.current) return
    const raw = sessionStorage.getItem('cineconnect_dm_draft')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { friendId?: string; content?: string }
      if (parsed.friendId) setSelectedFriendId(parsed.friendId)
      if (parsed.content) setInput(parsed.content)
    } catch {
    } finally {
      sessionStorage.removeItem('cineconnect_dm_draft')
      draftConsumedRef.current = true
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setWatchlist([])
      return
    }

    const loadWatchlist = () => {
      setWatchlist(getWatchlist(user.id))
    }

    loadWatchlist()
    window.addEventListener('storage', loadWatchlist)
    return () => window.removeEventListener('storage', loadWatchlist)
  }, [user])

  const { data: friends } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: fetchFriends,
    enabled: !!user
  })

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['friends'] }),
        refreshFriendRequests()
      ])
    }
  })

  const declineMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: async () => {
      await refreshFriendRequests()
    }
  })

  const { data: initialMessages } = useQuery({
    queryKey: ['messages', selectedFriendId],
    queryFn: () => fetchConversation(selectedFriendId!, 50),
    enabled: !!selectedFriendId
  })

  useEffect(() => {
    if (initialMessages) setMessages([...initialMessages].reverse())
  }, [selectedFriendId, initialMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!token) return
    const socket = io(window.location.origin, {
      auth: { token },
      path: '/socket.io'
    })
    socketRef.current = socket
    socket.on('connect', () => {
      console.log('[FriendFlow][Discussion] socket connected', {
        socketId: socket.id,
        userId: user?.id
      })
    })
    socket.on('connect_error', (err) => {
      console.log('[FriendFlow][Discussion] socket connect_error', {
        userId: user?.id,
        message: err.message
      })
    })
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, user?.id])

  useEffect(() => {
    if (!selectedFriendId || !socketRef.current) return
    socketRef.current.emit('join_room', selectedFriendId)
    return () => {
      socketRef.current?.emit('leave_room', selectedFriendId)
    }
  }, [selectedFriendId])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    const onMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg])
    }
    const onNewFriendRequest = (payload: unknown) => {
      console.log('[FriendFlow][Discussion] new_friend_request received', payload)
      void refreshFriendRequests()
    }
    socket.on('message', onMessage)
    socket.on('new_friend_request', onNewFriendRequest)
    return () => {
      socket.off('message', onMessage)
      socket.off('new_friend_request', onNewFriendRequest)
    }
  }, [refreshFriendRequests])

  function sendMessage() {
    if (!input.trim() || !selectedFriendId || !socketRef.current) return
    socketRef.current.emit('message', {
      receiverId: selectedFriendId,
      content: input.trim()
    })
    setInput('')
  }

  const selectedFriend = friends?.find((f) => f.friend_id === selectedFriendId)
  const selectedFriendMessages = messages.filter(
    (m) => m.sender_id === selectedFriendId || m.receiver_id === selectedFriendId
  )
  const groupedMessages = selectedFriendMessages.reduce(
    (acc, message) => {
      const dayKey = new Date(message.created_at).toDateString()
      const latestGroup = acc[acc.length - 1]
      if (!latestGroup || latestGroup.dayKey !== dayKey) {
        acc.push({
          dayKey,
          label: formatDay(message.created_at),
          items: [message]
        })
      } else {
        latestGroup.items.push(message)
      }
      return acc
    },
    [] as Array<{ dayKey: string; label: string; items: Message[] }>
  )

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-28 bottom-16 h-80 w-80 rounded-full bg-sky-300/10 blur-[130px]" />

      <div className="relative mx-auto flex h-[calc(100vh-80px)] max-w-[1300px]">
        <section className="flex w-full border-r border-zinc-800/80 bg-zinc-900/60 md:w-[390px] md:min-w-[390px]">
          <div className="flex w-full flex-col">
            <div className="border-b border-zinc-800/70 p-5">
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePanel('messages')}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    activePanel === 'messages'
                      ? 'border-sky-400/30 bg-sky-500/10 text-sky-200'
                      : 'border-zinc-800 bg-zinc-950/70 text-zinc-400'
                  }`}
                >
                  Messages
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel('watchlist')}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    activePanel === 'watchlist'
                      ? 'border-sky-400/30 bg-sky-500/10 text-sky-200'
                      : 'border-zinc-800 bg-zinc-950/70 text-zinc-400'
                  }`}
                >
                  Watchlist
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                {activePanel === 'messages'
                  ? 'Selectionne une conversation pour commencer'
                  : 'Affiche ta watchlist dans le panneau de droite'}
              </p>
            </div>

            {activePanel === 'messages' ? (
              <>
                <div className="border-b border-zinc-800/70 p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Demandes recues
                  </p>
                  {hasFriendRequestsError && (
                    <p className="mb-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      Erreur chargement demandes:{' '}
                      {friendRequestsError instanceof Error
                        ? friendRequestsError.message
                        : 'inconnue'}
                    </p>
                  )}
                  {friendRequests.length === 0 ? (
                    <p className="text-xs text-zinc-500">Aucune demande</p>
                  ) : (
                    <ul className="space-y-2">
                      {friendRequests.map((request) => (
                        <li
                          key={request.id}
                          className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3"
                        >
                          <p className="text-sm font-semibold text-zinc-100">{request.username}</p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => acceptMutation.mutate(request.id)}
                              disabled={acceptMutation.isPending || declineMutation.isPending}
                              className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Accepter
                            </button>
                            <button
                              type="button"
                              onClick={() => declineMutation.mutate(request.id)}
                              disabled={acceptMutation.isPending || declineMutation.isPending}
                              className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Refuser
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <ul className="space-y-1.5">
                    {(friends ?? []).map((f) => {
                      const isSelected = selectedFriendId === f.friend_id
                      return (
                        <li key={f.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedFriendId(f.friend_id)}
                            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                              isSelected
                                ? 'border-sky-400/30 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.18)]'
                                : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm font-semibold ${
                                  isSelected ? 'text-sky-200' : 'text-zinc-100'
                                }`}
                              >
                                {f.username}
                              </p>
                              <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                                ami
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {isSelected ? 'Conversation active' : 'Ouvrir la discussion'}
                            </p>
                          </button>
                        </li>
                      )
                    })}
                    {(friends ?? []).length === 0 ? (
                      <li className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
                        Aucun ami disponible pour le moment
                      </li>
                    ) : null}
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-6 text-center text-sm text-zinc-400">
                  Clique sur un film de ta watchlist a droite
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="hidden flex-1 flex-col bg-zinc-950/40 md:flex">
          {activePanel === 'watchlist' ? (
            <div className="flex h-full flex-col">
              <header className="flex h-20 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 backdrop-blur">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-zinc-100">Ma watchlist</h2>
                  <p className="text-xs uppercase tracking-[0.12em] text-sky-300">
                    {watchlist.length} film{watchlist.length > 1 ? 's' : ''}
                  </p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {watchlist.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-8 py-10 text-center">
                      <p className="text-lg font-bold uppercase tracking-[0.1em] text-zinc-300">
                        Watchlist vide
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Ajoute des films depuis la page Films
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {watchlist.map((film) => (
                      <article
                        key={film.id}
                        className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70"
                      >
                        <img src={film.posterUrl} alt={film.title} className="h-56 w-full object-cover" />
                        <div className="p-3">
                          <p className="line-clamp-2 text-sm font-semibold text-zinc-100">{film.title}</p>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            Ajoute le {new Date(film.addedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : selectedFriendId ? (
            <>
              <header className="flex h-20 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 backdrop-blur">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-zinc-100">
                    {selectedFriend?.username ?? 'Discussion'}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.12em] text-sky-300">
                    En ligne
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-sky-400/40 hover:text-sky-200"
                  >
                    Appel
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-sky-400/40 hover:text-sky-200"
                  >
                    Options
                  </button>
                </div>
              </header>

              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                  {groupedMessages.map((group) => (
                    <div key={group.dayKey} className="space-y-4">
                      <div className="flex justify-center">
                        <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                          {group.label}
                        </span>
                      </div>
                      {group.items.map((m) => {
                        const fromMe = m.sender_id === user.id
                        return (
                          <div
                            key={m.id}
                            className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                fromMe
                                  ? 'rounded-br-md bg-sky-500/90 text-slate-950 shadow-[0_4px_16px_rgba(14,165,233,0.28)]'
                                  : 'rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-200'
                              }`}
                            >
                              <p>{m.content}</p>
                              <p
                                className={`mt-1.5 text-[10px] ${
                                  fromMe ? 'text-slate-900/70' : 'text-zinc-500'
                                }`}
                              >
                                {formatTime(m.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <footer className="border-t border-zinc-800/80 bg-zinc-950/85 p-4">
                  <div className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage()
                      }}
                      placeholder="Ecris ton message..."
                      className="flex-1 bg-transparent px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      Envoyer
                    </button>
                  </div>
                </footer>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-8 py-10 text-center">
                <p className="text-lg font-bold uppercase tracking-[0.1em] text-zinc-300">
                  Messaging Studio
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Sélectionne un ami à gauche pour démarrer la discussion
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

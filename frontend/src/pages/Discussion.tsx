import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import { fetchFriends } from '@/services/friends'
import { fetchConversation } from '@/services/messages'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

export function DiscussionPage() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  if (!user) {
    navigate({ to: '/login' })
    return null
  }

  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends
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
    socket.on('connect_error', () => {})
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

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
    socket.on('message', onMessage)
    return () => {
      socket.off('message', onMessage)
    }
  }, [])

  function sendMessage() {
    if (!input.trim() || !selectedFriendId || !socketRef.current) return
    socketRef.current.emit('message', {
      receiverId: selectedFriendId,
      content: input.trim()
    })
    setInput('')
  }

  const selectedFriend = friends?.find((f) => f.friend_id === selectedFriendId)

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-4 py-8 md:flex-row md:gap-6">
      <aside className="w-full rounded-lg border border-slate-800 bg-slate-900/50 md:w-64">
        <h2 className="border-b border-slate-800 p-4 font-semibold text-white">
          Amis
        </h2>
        <ul className="max-h-96 overflow-y-auto">
          {(friends ?? []).map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setSelectedFriendId(f.friend_id)}
                className={`w-full px-4 py-3 text-left transition ${
                  selectedFriendId === f.friend_id
                    ? 'bg-amber-600/20 text-amber-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f.username}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="mt-6 flex flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900/50 md:mt-0">
        {selectedFriendId ? (
          <>
            <div className="border-b border-slate-800 p-4 font-medium text-white">
              Discussion avec {selectedFriend?.username ?? '…'}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender_id === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        m.sender_id === user.id
                          ? 'bg-amber-600/30 text-white'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      <p className="text-sm">{m.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(m.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 border-t border-slate-800 p-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage()
                  }}
                  placeholder="Votre message…"
                  className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500 disabled:opacity-50"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-slate-500">
            Sélectionnez un ami pour discuter
          </div>
        )}
      </div>
    </div>
  )
}
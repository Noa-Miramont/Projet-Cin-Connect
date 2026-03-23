import React, { createContext, useContext, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  type FriendRequest,
  fetchReceivedFriendRequests
} from '@/services/friends'

type NotificationsContextValue = {
  friendRequests: FriendRequest[]
  friendRequestsCount: number
  isLoadingFriendRequests: boolean
  hasFriendRequestsError: boolean
  friendRequestsError: Error | null
  refreshFriendRequests: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({
  children
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const {
    data: friendRequests,
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery({
    queryKey: ['friends', 'requests', 'received', user?.id],
    queryFn: fetchReceivedFriendRequests,
    enabled: !!user,
    staleTime: 0,
    refetchInterval: user ? 5000 : false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  })

  const value = useMemo<NotificationsContextValue>(() => {
    const requests = friendRequests ?? []
    return {
      friendRequests: requests,
      friendRequestsCount: requests.length,
      isLoadingFriendRequests: isLoading || isFetching,
      hasFriendRequestsError: isError,
      friendRequestsError: error instanceof Error ? error : null,
      refreshFriendRequests: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['friends', 'requests', 'received', user?.id]
        })
      }
    }
  }, [error, friendRequests, isError, isFetching, isLoading, queryClient, user?.id])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return ctx
}

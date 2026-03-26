import React, { createContext, useCallback, useContext, useMemo } from 'react'
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
  const friendRequestsQueryKey = useMemo(
    () => ['friends', 'requests', 'received', user?.id] as const,
    [user?.id]
  )

  const {
    data: friendRequests,
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery({
    queryKey: friendRequestsQueryKey,
    queryFn: fetchReceivedFriendRequests,
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  })

  const refreshFriendRequests = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: friendRequestsQueryKey
    })
  }, [friendRequestsQueryKey, queryClient])

  const value = useMemo<NotificationsContextValue>(() => {
    const requests = friendRequests ?? []
    return {
      friendRequests: requests,
      friendRequestsCount: requests.length,
      isLoadingFriendRequests: isLoading || isFetching,
      hasFriendRequestsError: isError,
      friendRequestsError: error instanceof Error ? error : null,
      refreshFriendRequests
    }
  }, [error, friendRequests, isError, isFetching, isLoading, refreshFriendRequests])

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

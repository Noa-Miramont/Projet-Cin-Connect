import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { api, getApiErrorMessage } from '@/services/api'
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  REFRESH_TOKEN_KEY,
  storeAuthSession,
  TOKEN_KEY,
  updateStoredUser,
  USER_KEY
} from '@/services/authStorage'

type User = {
  id: string
  email: string
  username: string
  createdAt: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: (options?: { redirect?: boolean }) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearAllStorage = useCallback(() => {
    localStorage.clear()
    sessionStorage.clear()
  }, [])

  const syncFromStoredSession = useCallback(() => {
    const nextToken = getStoredAccessToken()
    const nextUser = getStoredUser<User>()

    if (!nextToken || !nextUser) {
      setToken(null)
      setUser(null)
      queryClient.clear()
      return
    }

    setToken(nextToken)
    setUser(nextUser)
  }, [queryClient])

  const loadStored = useCallback(async () => {
    const storedToken = getStoredAccessToken()
    const storedRefreshToken = getStoredRefreshToken()
    const storedUser = getStoredUser<User>()

    if ((storedToken || storedRefreshToken) && storedUser) {
      try {
        setToken(storedToken)
        setUser(storedUser)
        const { data } = await api.get<User>('/auth/me')
        setUser(data)
        updateStoredUser(data)
        setToken(getStoredAccessToken())
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          clearAllStorage()
          clearStoredAuthSession()
          setToken(null)
          setUser(null)
        } else {
          console.error('[AUTH] session restore failed', {
            message: error instanceof Error ? error.message : 'Erreur inconnue'
          })
        }
      }
    }
    setIsLoading(false)
  }, [clearAllStorage])

  useEffect(() => {
    void loadStored()
  }, [loadStored])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      const watchedKeys = [TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]
      if (e.key !== null && !watchedKeys.includes(e.key)) return
      syncFromStoredSession()
    }

    function onAuthStorageEvent() {
      syncFromStoredSession()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(AUTH_STORAGE_EVENT, onAuthStorageEvent)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(AUTH_STORAGE_EVENT, onAuthStorageEvent)
    }
  }, [syncFromStoredSession])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<{
        user: User
        token: string
        accessToken?: string
        refreshToken: string
      }>('/auth/login', {
        email,
        password
      })
      const accessToken = data.accessToken ?? data.token
      queryClient.clear()
      clearAllStorage()
      storeAuthSession({
        accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      })
      setToken(accessToken)
      setUser(data.user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Impossible de se connecter'))
    }
  }, [clearAllStorage, queryClient])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const { data } = await api.post<{
          user: User
          token: string
          accessToken?: string
          refreshToken: string
        }>(
          '/auth/register',
          { username, email, password }
        )
        const accessToken = data.accessToken ?? data.token
        queryClient.clear()
        clearAllStorage()
        storeAuthSession({
          accessToken,
          refreshToken: data.refreshToken,
          user: data.user
        })
        setToken(accessToken)
        setUser(data.user)
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Impossible de créer le compte"))
      }
    },
    [clearAllStorage, queryClient]
  )

  const logout = useCallback((options?: { redirect?: boolean }) => {
    queryClient.clear()
    clearAllStorage()
    clearStoredAuthSession()
    setToken(null)
    setUser(null)
    if (options?.redirect ?? true) {
      window.location.assign('/login')
    }
  }, [clearAllStorage, queryClient])

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

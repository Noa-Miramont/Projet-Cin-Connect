import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, getApiErrorMessage } from '@/services/api'

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

const TOKEN_KEY = 'cineconnect_token'
const USER_KEY = 'cineconnect_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearAllStorage = useCallback(() => {
    localStorage.clear()
    sessionStorage.clear()
  }, [])

  const loadStored = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY)
    const u = localStorage.getItem(USER_KEY)
    if (t && u) {
      try {
        setToken(t)
        const parsedUser = JSON.parse(u) as User
        setUser(parsedUser)
        const { data } = await api.get<User>('/auth/me', {
          headers: { Authorization: `Bearer ${t}` }
        })
        setUser(data)
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      } catch {
        clearAllStorage()
        setToken(null)
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [clearAllStorage])

  useEffect(() => {
    void loadStored()
  }, [loadStored])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== TOKEN_KEY && e.key !== USER_KEY && e.key !== null) return
      const nextToken = localStorage.getItem(TOKEN_KEY)
      const nextUser = localStorage.getItem(USER_KEY)
      if (!nextToken || !nextUser) {
        setToken(null)
        setUser(null)
        queryClient.clear()
        return
      }
      try {
        setToken(nextToken)
        setUser(JSON.parse(nextUser) as User)
      } catch {
        clearAllStorage()
        setToken(null)
        setUser(null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [clearAllStorage, queryClient])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password
      })
      queryClient.clear()
      clearAllStorage()
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Impossible de se connecter'))
    }
  }, [clearAllStorage, queryClient])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const { data } = await api.post<{ user: User; token: string }>(
          '/auth/register',
          { username, email, password }
        )
        queryClient.clear()
        clearAllStorage()
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        setToken(data.token)
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

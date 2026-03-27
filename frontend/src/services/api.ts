import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  updateStoredAccessToken
} from './authStorage'

type ApiErrorPayload = {
  message?: string
  error?: string
  details?: string
}

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshRequest: Promise<string> | null = null

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) {
    throw new Error('Refresh token manquant')
  }

  if (!refreshRequest) {
    refreshRequest = axios
      .post<{ token?: string; accessToken?: string }>(
        '/api/auth/refresh',
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then(({ data }) => {
        const nextAccessToken = data.accessToken ?? data.token
        if (!nextAccessToken) {
          throw new Error('Réponse de refresh invalide')
        }
        updateStoredAccessToken(nextAccessToken)
        return nextAccessToken
      })
      .catch((error) => {
        clearStoredAuthSession()
        throw error
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken()
  if (token) {
    if (!config.headers) {
      config.headers = {}
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) {
      throw error
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status
    const refreshToken = getStoredRefreshToken()
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh')

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      isRefreshRequest ||
      !refreshToken
    ) {
      throw error
    }

    originalRequest._retry = true

    try {
      const nextAccessToken = await refreshAccessToken()
      if (!originalRequest.headers) {
        originalRequest.headers = {}
      }
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
      return api.request(originalRequest)
    } catch {
      throw error
    }
  }
)

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue'
) {
  if (isAxiosError<ApiErrorPayload>(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      fallback
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

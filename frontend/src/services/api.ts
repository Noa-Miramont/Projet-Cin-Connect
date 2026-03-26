import axios, { isAxiosError } from 'axios'

const TOKEN_KEY = 'cineconnect_token'

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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    if (!config.headers) {
      config.headers = {}
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

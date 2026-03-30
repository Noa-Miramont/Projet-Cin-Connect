export const TOKEN_KEY = 'dollyzoom_token'
export const REFRESH_TOKEN_KEY = 'dollyzoom_refresh_token'
export const USER_KEY = 'dollyzoom_user'
export const AUTH_STORAGE_EVENT = 'dollyzoom-auth-storage'

const LEGACY_TOKEN_KEY = 'cineconnect_token'
const LEGACY_REFRESH_TOKEN_KEY = 'cineconnect_refresh_token'
const LEGACY_USER_KEY = 'cineconnect_user'

function dispatchAuthStorageEvent() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT))
}

export function getStoredAccessToken() {
  return localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY)
}

export function getStoredRefreshToken() {
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ??
    localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY)
  )
}

export function getStoredUser<T>() {
  const rawUser = localStorage.getItem(USER_KEY) ?? localStorage.getItem(LEGACY_USER_KEY)
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as T
  } catch {
    clearStoredAuthSession()
    return null
  }
}

export function storeAuthSession<T>(params: {
  accessToken: string
  refreshToken: string
  user: T
}) {
  localStorage.setItem(TOKEN_KEY, params.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(params.user))
  dispatchAuthStorageEvent()
}

export function updateStoredAccessToken(accessToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  dispatchAuthStorageEvent()
}

export function updateStoredUser<T>(user: T) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  dispatchAuthStorageEvent()
}

export function clearStoredAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
  dispatchAuthStorageEvent()
}

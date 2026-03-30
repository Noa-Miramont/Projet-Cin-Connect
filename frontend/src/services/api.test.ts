import axios from 'axios'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

type InterceptorConfig = {
  headers?: Record<string, string>
}

type LocalStorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
}

function createLocalStorageMock(): LocalStorageLike {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    }
  }
}

function runRequestInterceptor(config: InterceptorConfig = {}) {
  const handlers = (api.interceptors.request as unknown as {
    handlers: Array<{ fulfilled?: (value: InterceptorConfig) => InterceptorConfig }>
  }).handlers

  const interceptor = handlers.find(
    (handler) => typeof handler.fulfilled === 'function'
  )?.fulfilled

  if (!interceptor) {
    throw new Error('Request interceptor not found')
  }

  return interceptor(config)
}

function runResponseRejectedInterceptor(error: unknown) {
  const handlers = (api.interceptors.response as unknown as {
    handlers: Array<{ rejected?: (value: unknown) => Promise<unknown> }>
  }).handlers

  const interceptor = handlers.find(
    (handler) => typeof handler.rejected === 'function'
  )?.rejected

  if (!interceptor) {
    throw new Error('Response interceptor not found')
  }

  return interceptor(error)
}

describe('api request interceptor', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true
    })
  })

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('adds Authorization header when a token is present', () => {
    localStorage.setItem('dollyzoom_token', 'token-123')
    const config = runRequestInterceptor({
      headers: { 'Content-Type': 'application/json' }
    })

    expect(config.headers?.Authorization).toBe('Bearer token-123')
    expect(config.headers?.['Content-Type']).toBe('application/json')
  })

  it('does not add Authorization header when there is no token', () => {
    const config = runRequestInterceptor({
      headers: { 'X-Test': 'yes' }
    })

    expect(config.headers?.Authorization).toBeUndefined()
    expect(config.headers?.['X-Test']).toBe('yes')
  })

  it('creates headers object when missing and token exists', () => {
    localStorage.setItem('dollyzoom_token', 'abc')
    const config = runRequestInterceptor({})

    expect(config.headers).toBeDefined()
    expect(config.headers?.Authorization).toBe('Bearer abc')
  })

  it('refreshes the access token and retries the request after a 401', async () => {
    localStorage.setItem('dollyzoom_token', 'expired-token')
    localStorage.setItem('dollyzoom_refresh_token', 'refresh-token-123')
    localStorage.setItem(
      'dollyzoom_user',
      JSON.stringify({ id: 'user-1', email: 'user@test.com', username: 'user' })
    )

    const refreshSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: { accessToken: 'new-access-token' }
    } as never)
    const retrySpy = vi.spyOn(api, 'request').mockResolvedValueOnce({
      data: { ok: true }
    } as never)

    const result = await runResponseRejectedInterceptor({
      isAxiosError: true,
      config: {
        url: '/reviews',
        headers: {}
      },
      response: {
        status: 401
      }
    })

    expect(refreshSpy).toHaveBeenCalledWith(
      '/api/auth/refresh',
      { refreshToken: 'refresh-token-123' },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    expect(localStorage.getItem('dollyzoom_token')).toBe('new-access-token')
    expect(retrySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        _retry: true,
        headers: expect.objectContaining({
          Authorization: 'Bearer new-access-token'
        })
      })
    )
    expect(result).toEqual({ data: { ok: true } })
  })
})

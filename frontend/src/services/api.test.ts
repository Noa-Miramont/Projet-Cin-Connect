import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
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

describe('api request interceptor', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true
    })
  })

  beforeEach(() => {
    localStorage.clear()
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
})

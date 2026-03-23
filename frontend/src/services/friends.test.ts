import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

import { api } from './api'
import {
  acceptFriendRequest,
  addFriend,
  declineFriendRequest,
  fetchFriends,
  fetchReceivedFriendRequests,
  removeFriend
} from './friends'

type MockedApi = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockedApi = api as unknown as MockedApi

describe('friends service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchFriends returns friend list (nominal case)', async () => {
    const payload = [
      {
        id: 'f1',
        friend_id: 'u2',
        username: 'alice',
        email: 'alice@test.com'
      }
    ]
    mockedApi.get.mockResolvedValueOnce({ data: payload })

    await expect(fetchFriends()).resolves.toEqual(payload)
    expect(mockedApi.get).toHaveBeenCalledWith('/friends')
  })

  it('fetchReceivedFriendRequests handles empty list (edge case)', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] })

    await expect(fetchReceivedFriendRequests()).resolves.toEqual([])
    expect(mockedApi.get).toHaveBeenCalledWith('/friends/requests/received')
  })

  it('addFriend posts username and returns API payload (nominal case)', async () => {
    const payload = {
      id: 'req-1',
      friend_id: 'u3',
      username: 'bob',
      status: 'PENDING' as const
    }
    mockedApi.post.mockResolvedValueOnce({ data: payload })

    await expect(addFriend('bob')).resolves.toEqual(payload)
    expect(mockedApi.post).toHaveBeenCalledWith('/friends', { username: 'bob' })
  })

  it('addFriend propagates API errors (error handling)', async () => {
    mockedApi.post.mockRejectedValueOnce(new Error('Utilisateur non trouvé'))

    await expect(addFriend('unknown')).rejects.toThrow('Utilisateur non trouvé')
    expect(mockedApi.post).toHaveBeenCalledWith('/friends', { username: 'unknown' })
  })

  it('removeFriend calls DELETE on the expected endpoint', async () => {
    mockedApi.delete.mockResolvedValueOnce(undefined)

    await expect(removeFriend('friend-id')).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith('/friends/friend-id')
  })

  it('acceptFriendRequest and declineFriendRequest call correct endpoints', async () => {
    mockedApi.post.mockResolvedValueOnce(undefined)
    mockedApi.delete.mockResolvedValueOnce(undefined)

    await expect(acceptFriendRequest('req-id')).resolves.toBeUndefined()
    await expect(declineFriendRequest('req-id')).resolves.toBeUndefined()

    expect(mockedApi.post).toHaveBeenCalledWith('/friends/requests/req-id/accept')
    expect(mockedApi.delete).toHaveBeenCalledWith('/friends/requests/req-id')
  })
})

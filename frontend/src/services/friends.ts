import { api } from './api'

export type Friend = {
  id: string
  friend_id: string
  username: string
  email: string
}

export type FriendRequest = {
  id: string
  requester_id: string
  username: string
  email: string
  created_at: string
}

export async function fetchFriends(): Promise<Friend[]> {
  const { data } = await api.get<Friend[]>('/friends')
  return data
}

export async function addFriend(username: string): Promise<{
  id: string
  friend_id: string
  username: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
}> {
  const { data } = await api.post('/friends', { username })
  return data
}

export async function removeFriend(id: string): Promise<void> {
  await api.delete(`/friends/${id}`)
}

export async function fetchReceivedFriendRequests(): Promise<FriendRequest[]> {
  const { data } = await api.get<FriendRequest[]>('/friends/requests/received')
  return data
}

export async function acceptFriendRequest(id: string): Promise<void> {
  await api.post(`/friends/requests/${id}/accept`)
}

export async function declineFriendRequest(id: string): Promise<void> {
  await api.delete(`/friends/requests/${id}`)
}

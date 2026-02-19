import { api } from './api'

export type Friend = {
  id: string
  friend_id: string
  username: string
  email: string
}

export async function fetchFriends(): Promise<Friend[]> {
  const { data } = await api.get<Friend[]>('/friends')
  return data
}

export async function addFriend(username: string): Promise<{ id: string; friend_id: string; username: string }> {
  const { data } = await api.post('/friends', { username })
  return data
}

export async function removeFriend(id: string): Promise<void> {
  await api.delete(`/friends/${id}`)
}

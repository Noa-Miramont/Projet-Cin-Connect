import { api } from './api'

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  sender_username?: string
}

export async function fetchConversation(
  userId: string,
  limit?: number
): Promise<Message[]> {
  const { data } = await api.get<Message[]>('/messages', {
    params: { userId, limit }
  })
  return data
}

import type { UserPublic } from './user'

export interface Message {
  id: string
  roomId: string
  userId: string
  content: string
  createdAt: Date
}

export interface MessageWithUser extends Message {
  user?: UserPublic
}

export interface MessageCreateInput {
  roomId: string
  content: string
}

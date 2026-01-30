export interface User {
  id: string
  email: string
  username: string
  passwordHash?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserCreateInput {
  email: string
  username: string
  password: string
}

export interface UserPublic {
  id: string
  email: string
  username: string
  avatarUrl?: string
  createdAt: Date
}

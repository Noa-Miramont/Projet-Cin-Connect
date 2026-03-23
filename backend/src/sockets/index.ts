import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { messageService } from '../services/message'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
let ioInstance: Server | null = null

function roomName(userId1: string, userId2: string) {
  return `chat-${[userId1, userId2].sort().join('-')}`
}

function userRoomName(userId: string) {
  return `user-${userId}`
}

export function emitNewFriendRequest(receiverId: string, payload: {
  requestId: string
  requesterId: string
  requesterUsername?: string
  createdAt?: string
}) {
  if (!ioInstance) return
  ioInstance.to(userRoomName(receiverId)).emit('new_friend_request', payload)
}

export function initSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true }
  })
  ioInstance = io

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ??
      (socket.handshake.headers.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : null)
    if (!token) {
      return next(new Error('Token manquant'))
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string }
      ;(socket as unknown as { data: { userId: string } }).data = {
        userId: payload.id
      }
      next()
    } catch {
      next(new Error('Token invalide'))
    }
  })

  io.on('connection', (socket) => {
    const userId = (socket as unknown as { data: { userId: string } }).data
      .userId
    console.log('[Socket] Client connected:', socket.id, 'user:', userId)
    socket.join(userRoomName(userId))

    socket.on('join_room', (otherUserId: string) => {
      const room = roomName(userId, otherUserId)
      socket.join(room)
    })

    socket.on('leave_room', (otherUserId: string) => {
      const room = roomName(userId, otherUserId)
      socket.leave(room)
    })

    socket.on('message', async (payload: { receiverId: string; content: string }) => {
      const { receiverId, content } = payload
      if (!receiverId || !content?.trim()) return
      try {
        const msg = await messageService.send(userId, receiverId, content.trim())
        const room = roomName(userId, receiverId)
        io.to(room).emit('message', {
          id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          content: msg.content,
          created_at: msg.created_at
        })
      } catch (_err) {
        socket.emit('error', { message: 'Impossible d’envoyer le message' })
      }
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id)
    })
  })

  return io
}

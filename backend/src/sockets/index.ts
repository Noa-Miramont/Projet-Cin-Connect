import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

export function initSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true }
  })

  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id)
    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id)
    })
  })

  return io
}

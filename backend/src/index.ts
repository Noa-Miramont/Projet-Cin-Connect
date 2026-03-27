import 'dotenv/config'
import { createServer } from './server'
import { initSockets } from './sockets'

const PORT = process.env.PORT ?? 3000

const app = createServer()
const httpServer = app.listen(PORT, () => {
  console.log(`[Dolly Zoom] API running on http://localhost:${PORT}`)
  console.log(`[Dolly Zoom] Swagger: http://localhost:${PORT}/api-docs`)
})

initSockets(httpServer)

import express, { type Express } from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { router } from './routes'

const app: Express = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`)
  next()
})

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CinéConnect API',
      version: '1.0.0',
      description: 'API REST CinéConnect'
    },
    servers: [{ url: '/api', description: 'API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (_req, res) => {
  res.json({
    message: 'CineConnect backend is running',
    routes: {
      health: '/health',
      api: '/api',
      authForgotPassword: '/api/auth/forgot-password',
      authResetPassword: '/api/auth/reset-password',
      docs: '/api-docs'
    }
  })
})

app.use('/api', router)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

export function createServer(): Express {
  return app
}

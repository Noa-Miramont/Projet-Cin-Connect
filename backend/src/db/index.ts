import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/cineconnect'
const client = new pg.Pool({ connectionString })

export const db = drizzle(client)

import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/dollyzoom'
const client = new pg.Pool({ connectionString })

export const db = drizzle(client, { schema })
export * from './schema'

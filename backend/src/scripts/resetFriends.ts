import 'dotenv/config'
import { Client } from 'pg'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL manquant')
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    const before = await client.query<{ count: string }>(
      'select count(*)::text as count from friends'
    )
    const deleted = await client.query<{ count: string }>(
      'delete from friends returning id'
    )
    const after = await client.query<{ count: string }>(
      'select count(*)::text as count from friends'
    )

    console.log('[friends:reset] rows before:', Number(before.rows[0]?.count ?? 0))
    console.log('[friends:reset] rows deleted:', deleted.rowCount ?? 0)
    console.log('[friends:reset] rows after :', Number(after.rows[0]?.count ?? 0))
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('[friends:reset] failed:', err)
  process.exit(1)
})

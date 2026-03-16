import 'dotenv/config'
import { db } from './index'
import { films } from './schema'
import { and, isNotNull, notLike, eq } from 'drizzle-orm'

async function fixPosters() {
  const malformed = await db
    .select()
    .from(films)
    .where(
      and(
        isNotNull(films.poster_url),
        notLike(films.poster_url, 'http%')
      )
    )

  if (!malformed.length) {
    console.log('Aucune affiche à corriger')
    return
  }

  console.log(`Correction de ${malformed.length} affiches…`)

  for (const film of malformed) {
    const poster = film.poster_url as string
    const fixed = `https://m.media-amazon.com/images/M/${poster}`

    await db
      .update(films)
      .set({ poster_url: fixed })
      .where(eq(films.id, film.id))

    console.log(`Film "${film.title}" corrigé`)
  }

  console.log('Correction des affiches terminée')
}

fixPosters().catch((err) => {
  console.error(err)
  process.exit(1)
})


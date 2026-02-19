import 'dotenv/config'
import { db } from './index'
import { categories, films } from './schema'
import { omdbService } from '../services/omdb'

const CATEGORY_MAP: Record<string, string> = {
  'sci-fi': 'Science-Fiction',
  'science fiction': 'Science-Fiction',
  'science-fiction': 'Science-Fiction',
  action: 'Action',
  drama: 'Drame',
  comedy: 'Comédie',
  comédie: 'Comédie',
  adventure: 'Aventure',
  thriller: 'Thriller',
  romance: 'Romance',
  horror: 'Horreur',
  animation: 'Animation'
}

function mapGenreToCategoryName(genreStr: string): string {
  if (!genreStr) return 'Drame'
  const first = genreStr.split(',')[0]?.trim().toLowerCase() ?? ''
  return CATEGORY_MAP[first] ?? 'Drame'
}

async function seed() {
  const existingCategories = await db.select().from(categories)
  const categoryNames = [
    'Drame',
    'Action',
    'Comédie',
    'Science-Fiction',
    'Aventure',
    'Thriller',
    'Romance',
    'Horreur',
    'Animation'
  ]
  const existingNames = new Set(existingCategories.map((c) => c.name))
  const toAdd = categoryNames.filter((n) => !existingNames.has(n))
  if (toAdd.length > 0) {
    await db.insert(categories).values(toAdd.map((name) => ({ name })))
    console.log('Catégories ajoutées:', toAdd.join(', '))
  }
  const categoryRows = await db.select().from(categories)

  const existingFilms = await db.select({ id: films.id }).from(films)
  if (existingFilms.length > 15) {
    console.log('Déjà beaucoup de films en base, skip seed OMDb.')
    process.exit(0)
  }

  const nameToId = Object.fromEntries(
    categoryRows.map((c) => [c.name, c.id])
  ) as Record<string, string>

  const searchQueries = [
    'inception',
    'dark knight',
    'interstellar',
    'forrest gump',
    'la la land',
    'matrix',
    'avatar',
    'titanic',
    'pulp fiction',
    'gladiator'
  ]

  const seenImdb = new Set<string>()
  const toInsert: Array<{
    title: string
    description: string | null
    year: number | null
    director: string | null
    poster_url: string | null
    category_id: string | null
  }> = []

  for (const query of searchQueries) {
    try {
      const searchRes = await omdbService.search(query, 1)
      const list = searchRes.Search ?? []
      for (let i = 0; i < Math.min(3, list.length); i++) {
        const item = list[i]
        if (!item || seenImdb.has(item.imdbID)) continue
        seenImdb.add(item.imdbID)
        const detail = await omdbService.getById(item.imdbID)
        if (!detail) continue
        const year = parseInt(detail.Year, 10)
        const catName = mapGenreToCategoryName(detail.Genre ?? '')
        const categoryId = nameToId[catName] ?? null
        toInsert.push({
          title: detail.Title,
          description: detail.Plot ?? null,
          year: Number.isNaN(year) ? null : year,
          director: detail.Director ?? null,
          poster_url:
            detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : null,
          category_id: categoryId
        })
      }
      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      console.warn('OMDb search failed for', query, (err as Error).message)
    }
  }

  if (toInsert.length > 0) {
    await db.insert(films).values(toInsert)
    console.log(`${toInsert.length} films insérés depuis OMDb.`)
  }

  console.log('Seed terminé.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

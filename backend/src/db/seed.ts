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

  const existingFilms = await db
    .select({ id: films.id, category_id: films.category_id })
    .from(films)

  const nameToId = Object.fromEntries(
    categoryRows.map((c) => [c.name, c.id])
  ) as Record<string, string>
  const idToName = Object.fromEntries(
    categoryRows.map((c) => [c.id, c.name])
  ) as Record<string, string>

  const TARGET_PER_CATEGORY: Record<string, number> = {
    'Romance': 40,
    'Science-Fiction': 40,
    'Thriller': 40,
    'Aventure': 40,
    'Horreur': 40
  }

  const currentPerCategory: Record<string, number> = {}
  for (const row of existingFilms) {
    const catId = row.category_id
    if (!catId) continue
    const catName = idToName[catId]
    if (!catName) continue
    currentPerCategory[catName] = (currentPerCategory[catName] ?? 0) + 1
  }

  const allTargetsReached = Object.entries(TARGET_PER_CATEGORY).every(
    ([name, target]) => (currentPerCategory[name] ?? 0) >= target
  )
  if (allTargetsReached) {
    console.log(
      'Toutes les catégories cibles sont déjà suffisamment remplies, skip seed OMDb.'
    )
    process.exit(0)
  }

  const searchQueries = [
    // Science-fiction
    'inception',
    'interstellar',
    'matrix',
    'blade runner',
    'blade runner 2049',
    'arrival',
    'dune',
    'dune part two',
    'ex machina',
    'minority report',
    'edge of tomorrow',
    'ready player one',
    'the fifth element',
    'star wars',
    'star wars revenge of the sith',
    'star wars the empire strikes back',
    'star trek',
    'avatar',
    'jurassic park',
    'jurassic world',

    // Romance
    'la la land',
    'titanic',
    'the notebook',
    'pride and prejudice',
    'before sunrise',
    'before sunset',
    'before midnight',
    'crazy stupid love',
    'about time',
    'call me by your name',
    'a star is born',
    'notting hill',
    'romeo and juliet',
    'romeo + juliet',
    'eternal sunshine of the spotless mind',
    'silver linings playbook',
    'me before you',
    '500 days of summer',

    // Thriller
    'dark knight',
    'se7en',
    'gone girl',
    'shutter island',
    'fight club',
    'memento',
    'prisoners',
    'zodiac',
    'nightcrawler',
    'black swan',
    'the girl with the dragon tattoo',
    'oldboy',
    'no country for old men',
    'the silence of the lambs',
    'sicario',
    'heat',
    'the departed',

    // Aventure
    'gladiator',
    'lord of the rings',
    'lord of the rings the two towers',
    'lord of the rings the return of the king',
    'pirates of the caribbean',
    'pirates of the caribbean dead mans chest',
    'indiana jones',
    'indiana jones and the last crusade',
    'mad max fury road',
    'hunger games',
    'hunger games catching fire',
    'the revenant',
    'life of pi',
    'cast away',
    'the hobbit',
    'king kong',
    'jurassic park 3',

    // Horreur
    'the conjuring',
    'the conjuring 2',
    'the exorcist',
    'hereditary',
    'it',
    'it chapter two',
    'the babadook',
    'get out',
    'insidious',
    'insidious chapter 2',
    'sinister',
    'a nightmare on elm street',
    'halloween',
    'the shining',
    'midsommar',
    'the ring',
    'the grudge',
    'paranormal activity',
    'the hills have eyes',

    // Divers / action pour remplir
    'mission impossible',
    'james bond skyfall',
    'james bond casino royale',
    'toy story',
    'shrek',
    'the godfather',
    'rocky',
    'fast and furious',
    'batman begins',
    'spider man',
    'iron man',
    'forrest gump',
    'pulp fiction'
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

  const maxPagesPerQuery = 3
  const maxResultsPerPage = 10

  outer: for (const query of searchQueries) {
    for (let page = 1; page <= maxPagesPerQuery; page++) {
      try {
        const searchRes = await omdbService.search(query, page)
        const list = searchRes.Search ?? []
        for (let i = 0; i < Math.min(maxResultsPerPage, list.length); i++) {
          const item = list[i]
          if (!item || seenImdb.has(item.imdbID)) continue
          seenImdb.add(item.imdbID)
          const detail = await omdbService.getById(item.imdbID)
          if (!detail) continue
          const year = parseInt(detail.Year, 10)
          const catName = mapGenreToCategoryName(detail.Genre ?? '')
          const categoryId = nameToId[catName] ?? null

          const targetForCat = TARGET_PER_CATEGORY[catName]
          if (targetForCat != null) {
            const current = currentPerCategory[catName] ?? 0
            if (current >= targetForCat) {
              continue
            }
            currentPerCategory[catName] = current + 1
          }

          let posterUrl: string | null = null
          if (detail.Poster && detail.Poster !== 'N/A') {
            if (detail.Poster.startsWith('http')) {
              posterUrl = detail.Poster
            } else {
              posterUrl = `https://m.media-amazon.com/images/M/${detail.Poster}`
            }
          }

          toInsert.push({
            title: detail.Title,
            description: detail.Plot ?? null,
            year: Number.isNaN(year) ? null : year,
            director: detail.Director ?? null,
            poster_url: posterUrl,
            category_id: categoryId
          })
        }
        await new Promise((r) => setTimeout(r, 500))
      } catch (err) {
        console.warn(
          'OMDb search failed for',
          query,
          'page',
          page,
          (err as Error).message
        )
        break
      }
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

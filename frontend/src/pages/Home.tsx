import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFilms } from '@/services/films'
import { fetchCategories } from '@/services/categories'
import { FilmCard } from '@/components/FilmCard'
import MagicRings from '@/components/hero_section/MagicRings'
import DollyZoom from '@/components/Dolly_zoom/Dolly_zoom'
import Cubes from '@/components/Cubes/Cubes'
import { ScrollFillText } from '@/components/ScrollFillText'

export function HomePage() {
  const { data: filmsData, isLoading: filmsLoading } = useQuery({
    queryKey: ['films', { limit: 10, sort: 'popular' }],
    queryFn: () => fetchFilms({ limit: 10, sort: 'year' })
  })
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  })

  return (
    <div>
      <section className="relative h-screen w-screen overflow-hidden border-b border-zinc-800 bg-black">
        <div className="absolute inset-0">
          <MagicRings
            color="#ffffff"
            colorTwo="#009dff"
            ringCount={5}
            speed={1}
            attenuation={15}
            lineThickness={1}
            baseRadius={0.4}
            radiusStep={0.14}
            scaleRate={0.1}
            opacity={1}
            blur={0}
            noiseAmount={0}
            rotation={0}
            ringGap={1.5}
            fadeIn={0.1}
            fadeOut={0.5}
            followMouse={false}
            mouseInfluence={0.2}
            hoverScale={1.2}
            parallax={0.025}
            clickBurst={false}
          />
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex h-full w-full items-center justify-center px-4">
          <h1 className="text-center text-6xl font-extrabold uppercase tracking-tight text-white md:text-8xl lg:text-9xl">
            Dolly Zoom
          </h1>
        </div>
      </section>

      <section className="bg-zinc-900 px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-zinc-100 md:text-5xl">
            Pourquoi Dolly Zoom
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: 'Decouverte rapide',
                text: 'Accede instantanement aux dernieres sorties et tendances.'
              },
              {
                title: 'Navigation fluide',
                text: "Une interface pensee pour une exploration sans friction."
              },
              {
                title: 'Catalogue organise',
                text: "Des milliers de titres classes pour trouver l'essentiel."
              },
              {
                title: 'Experience immersive',
                text: "Une atmosphere sombre et cinematographique."
              }
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-zinc-800/70 bg-zinc-950/70 p-6 transition hover:border-sky-400/60"
              >
                <h3 className="text-xl font-bold text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-zinc-100 md:text-5xl">
              Fonctionnalites
            </h2>
            <p className="max-w-md text-zinc-500">
              Une base solide et moderne pour explorer le cinema simplement.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-800/50 md:grid-cols-3">
            {[
              ['01', 'Films populaires', "Les titres qui font l'actualite"],
              ['02', 'Filtres avances', 'Genre, annee et categories en un clic'],
              ['03', 'Navigation intuitive', 'Trouve rapidement ce que tu veux voir'],
              ['04', 'UX fluide', 'Une interface rapide et agreable'],
              ['05', 'Design moderne', 'Un style dark avec accents lumineux'],
              ['06', 'Accessibilite', 'Lisible, propre, et adapte mobile']
            ].map(([index, title, text]) => (
              <article key={index} className="bg-zinc-950 p-8">
                <p className="text-xs font-bold tracking-widest text-sky-400">{index}</p>
                <h3 className="mt-2 text-2xl font-bold text-zinc-100">{title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-24 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-zinc-100 md:text-5xl">
            Films populaires
          </h2>
          <Link
            to="/films"
            className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-bold uppercase tracking-wider text-zinc-200 transition hover:border-sky-400 hover:text-sky-300"
          >
            Voir tout
          </Link>
        </div>
        {filmsLoading ? (
          <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 flex max-w-7xl gap-6 overflow-x-auto pb-4">
            {(filmsData?.films ?? []).map((film) => (
              <div key={film.id} className="w-44 flex-shrink-0 sm:w-52">
                <FilmCard film={film} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-zinc-900 px-6 py-24 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-zinc-100 md:text-5xl">
            Parcourir par categorie
          </h2>
          {categoriesLoading ? (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-11 w-28 animate-pulse rounded-full bg-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {(categories ?? []).map((cat) => (
                <Link
                  key={cat.id}
                  to="/films/$category"
                  params={{ category: cat.id }}
                  className="rounded-full border border-zinc-700 bg-zinc-950/50 px-5 py-2 text-sm font-bold uppercase tracking-wider text-zinc-300 transition hover:border-sky-400 hover:text-sky-300"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 px-6 py-28 md:px-10">
        <div className="absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative w-full max-w-4xl mx-auto px-4">
          <span className="text-xs sm:text-sm font-medium uppercase tracking-wider mb-8 sm:mb-16 text-zinc-500 block">
            A PROPOS DU PROJET
          </span>

          {/* Timeline - Mobile: vertical simple, Desktop: alternating */}
          <div className="relative">
            {/* Ligne verticale - à gauche sur mobile, centrée sur desktop */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 md:-translate-x-1/2" />

            {/* Étape 1 - Analyse */}
            <div className="relative flex items-start mb-12 sm:mb-24">
              {/* Point sur la ligne */}
              <div className="absolute left-4 md:left-1/2 w-2 h-2 bg-zinc-700 rounded-full -translate-x-1/2 top-3" />

              {/* Mobile: tout à droite, Desktop: gauche */}
              <div className="w-full pl-10 md:pl-0 md:w-1/2 md:pr-12 md:text-right">
                <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium bg-zinc-800 mb-4 sm:mb-6 text-zinc-200">
                  Dolly Zoom ?
                </span>
                <ScrollFillText
                  text="CineConnect n'est pas qu'un simple catalogue. C'est un hommage au cinéma, conçu par et pour les passionnés du septième art. Notre vision est de recréer cette sensation unique de découverte que l'on éprouve en entrant dans une salle obscure."
                  className="text-base sm:text-xl lg:text-2xl leading-relaxed"
                  grayClassName="text-zinc-700"
                  whiteClassName="text-zinc-200"
                />
              </div>
              <div className="hidden md:block w-1/2 pl-12" />
            </div>

            {/* Étape 2 - Développement */}
            <div className="relative flex items-start mb-12 sm:mb-24">
              {/* Point sur la ligne */}
              <div className="absolute left-4 md:left-1/2 w-2 h-2 bg-zinc-700 rounded-full -translate-x-1/2 top-3" />

              {/* Mobile: tout à droite, Desktop: droite */}
              <div className="hidden md:block w-1/2 pr-12" />
              <div className="w-full pl-10 md:pl-12 md:w-1/2">
                <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium bg-zinc-800 mb-4 sm:mb-6 text-zinc-200">
                  Notre plateforme
                </span>
                <ScrollFillText
                  text="À travers une interface minimaliste et immersive, nous mettons en lumière les œuvres qui méritent d'être vues, des chefs-d'œuvre oubliés aux blockbusters de demain. Chaque interaction, chaque pixel a été pensé pour s'effacer devant l'image et l'émotion."
                  className="text-base sm:text-xl lg:text-2xl leading-relaxed"
                  grayClassName="text-zinc-700"
                  whiteClassName="text-zinc-200"
                />
              </div>
            </div>

            {/* Étape 3 - Suivi & optimisation */}
            <div className="relative flex items-start">
              {/* Point sur la ligne */}
              <div className="absolute left-4 md:left-1/2 w-2 h-2 bg-zinc-700 rounded-full -translate-x-1/2 top-3" />

              {/* Mobile: tout à droite, Desktop: gauche */}
              <div className="w-full pl-10 md:pl-0 md:w-1/2 md:pr-12 md:text-right">
                <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium bg-zinc-800 mb-4 sm:mb-6 text-zinc-200">
                  Votre Expérience 
                </span>

                <ScrollFillText
                  text="Une fois la découverte lancée, on affine en continu : recommandations plus pertinentes, navigation plus fluide et une expérience toujours plus immersive du premier clic à la dernière image."
                  className="text-base sm:text-xl lg:text-2xl leading-relaxed"
                  grayClassName="text-zinc-700"
                  whiteClassName="text-zinc-200"
                />
              </div>
              <div className="hidden md:block w-1/2 pl-12" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800/70 bg-zinc-950 px-6 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col items-center gap-8">
            <div className="w-full max-w-[720px] mx-auto">
              <Cubes
                columns={12}
                rows={7}
                cellGap={{ col: 6, row: 6 }}
                maxAngle={45}
                radius={3}
                easing="power3.out"
                duration={{ enter: 0.3, leave: 0.6 }}
                borderStyle="1px solid #fff"
                faceColor="#060010"
                shadow={false}
                autoAnimate={true}
                rippleOnClick={true}
                rippleColor="#fff"
                rippleSpeed={2}
              />
            </div>
            <div className="h-48 w-full max-w-5xl">
              <DollyZoom
                text="dolly zoom"
                flex
                alpha
                stroke={false}
                width
                weight={false}
                italic={false}
                textColor="#ffffff"
                strokeColor="#ffffff"
                minFontSize={36}
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-lg font-bold text-zinc-200">Dolly Zoom</p>
              <p className="text-xs text-zinc-500">2026 Dolly Zoom. A Cinephile Project.</p>
            </div>
            <div className="flex gap-6 text-xs text-zinc-500">
              <a href="#" className="transition hover:text-sky-400">
                Privacy
              </a>
              <a href="#" className="transition hover:text-sky-400">
                Terms
              </a>
              <a href="#" className="transition hover:text-sky-400">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

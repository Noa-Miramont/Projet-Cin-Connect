import { Link } from '@tanstack/react-router'
import type { Film } from '@/services/films'
import { PosterImage } from '@/components/PosterImage'

type Props = { film: Film }

export function FilmCard({ film }: Props) {
  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="block overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition hover:border-zinc-500/60"
    >
      <div className="aspect-[2/3] bg-zinc-900">
        <PosterImage
          src={film.poster_url}
          alt={film.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-white line-clamp-2">{film.title}</h3>
        {film.year != null && (
          <p className="mt-1 text-sm text-zinc-400">{film.year}</p>
        )}
      </div>
    </Link>
  )
}

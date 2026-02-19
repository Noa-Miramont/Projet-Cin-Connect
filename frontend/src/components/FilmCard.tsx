import { Link } from '@tanstack/react-router'
import type { Film } from '@/services/films'

type Props = { film: Film }

export function FilmCard({ film }: Props) {
  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="block overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 transition hover:border-amber-600/50"
    >
      <div className="aspect-[2/3] bg-slate-800">
        {film.poster_url ? (
          <img
            src={film.poster_url}
            alt={film.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            Affiche indisponible
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-white line-clamp-2">{film.title}</h3>
        {film.year != null && (
          <p className="mt-1 text-sm text-slate-400">{film.year}</p>
        )}
      </div>
    </Link>
  )
}

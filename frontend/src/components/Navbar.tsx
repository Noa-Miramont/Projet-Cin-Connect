import { Link } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const { friendRequestsCount } = useNotifications()

  if (isLoading) {
    return (
      <nav className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-white">
            CinéConnect
          </Link>
          <span className="text-slate-500">Chargement…</span>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-white">
          CinéConnect
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/films"
            className="text-slate-300 transition hover:text-white"
          >
            Films
          </Link>
          {user ? (
            <>
              <Link
                to="/profil"
                className="text-slate-300 transition hover:text-white"
              >
                Profil
              </Link>
              <Link
                to="/discussion"
                className="relative text-slate-300 transition hover:text-white"
              >
                Discussion
                {friendRequestsCount > 0 && (
                  <span className="absolute -right-4 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-5 text-white">
                    {friendRequestsCount}
                  </span>
                )}
              </Link>
              <span className="text-slate-400">{user.username}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-300 transition hover:text-white"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-500"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

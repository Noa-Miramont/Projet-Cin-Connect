import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => register(username, email, password),
    onSuccess: () => navigate({ to: '/' }),
    onError: (err: Error) => setError(err.message)
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Inscription</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded bg-red-900/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="username" className="block text-sm text-slate-400">
            Pseudo
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-slate-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-slate-400">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm text-slate-400">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded bg-amber-600 py-2 font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
        >
          {mutation.isPending ? 'Inscription…' : "S'inscrire"}
        </button>
      </form>
      <p className="mt-4 text-center text-slate-400">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-amber-400 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}

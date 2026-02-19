import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: () => navigate({ to: '/' }),
    onError: (err: Error) => setError(err.message)
  })
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Connexion</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded bg-red-900/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
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
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded bg-amber-600 py-2 font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
        >
          {mutation.isPending ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <p className="mt-4 text-center text-slate-400">
        Pas de compte ?{' '}
        <Link to="/register" className="text-amber-400 hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  )
}

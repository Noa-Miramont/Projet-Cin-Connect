import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '@/services/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => forgotPassword(email),
    onSuccess: () => {
      setSent(true)
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
      setSent(false)
    }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(false)
    setError(null)
    mutation.mutate()
  }

  const isInvalidEmail = !email || !email.includes('@')

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Saisissez l'adresse email de votre compte. Si elle existe, un lien de
        réinitialisation sera envoyé.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded bg-red-900/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {sent && !error && (
          <div className="rounded bg-emerald-900/40 px-3 py-2 text-sm text-emerald-200">
            Email envoyé. Consultez votre boite mail puis cliquez sur le lien
            de réinitialisation.
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          />
        </div>
        <button
          type="submit"
          disabled={isInvalidEmail || mutation.isPending}
          className="w-full rounded bg-zinc-100 py-2 font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? 'Envoi…' : 'Envoyer'}
        </button>
      </form>

      <p className="mt-6 text-center text-zinc-400">
        Retour à la{' '}
        <Link to="/login" className="text-zinc-200 hover:underline">
          connexion
        </Link>
      </p>
    </div>
  )
}

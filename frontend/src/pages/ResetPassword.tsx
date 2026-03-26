import { useEffect, useMemo, useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '@/services/auth'
import { PasswordRequirements } from '@/components/PasswordRequirements'
import { isStrongPassword } from '@/lib/password'

export function ResetPasswordPage() {
  const search = useSearch({ from: '/reset-password' }) as { token?: string }
  const [token, setToken] = useState(search?.token ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setToken(search?.token ?? '')
  }, [search?.token])

  const passwordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  )
  const passwordIsStrong = useMemo(() => isStrongPassword(password), [password])

  const isSubmitDisabled =
    !token || !password || !confirmPassword || !passwordsMatch || !passwordIsStrong

  const mutation = useMutation({
    mutationFn: () => resetPassword(token, password),
    onSuccess: () => {
      setSuccess(true)
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
      setSuccess(false)
    }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!token) {
      setError('Lien de réinitialisation manquant. Ajoutez ?token=XXX dans l’URL.')
      return
    }
    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (!passwordIsStrong) {
      setError(
        'Le mot de passe doit respecter toutes les conditions de securite.'
      )
      return
    }

    mutation.mutate()
  }

  const tokenPreview = token
    ? `${token.slice(0, 6)}…${token.slice(-4)}`
    : 'Aucun token détecté'

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Réinitialiser le mot de passe</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Token détecté dans le lien reçu par email :{' '}
        <span className="text-zinc-200">{tokenPreview}</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded bg-red-900/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded bg-emerald-900/40 px-3 py-2 text-sm text-emerald-200">
            Mot de passe modifié avec succès. Vous pouvez vous reconnecter.
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm text-zinc-400">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setSuccess(false)
            }}
            required
            className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          />
          <PasswordRequirements password={password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm text-zinc-400">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setSuccess(false)
            }}
            required
            className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-white"
          />
          {!passwordsMatch && confirmPassword.length > 0 && (
            <p className="mt-1 text-xs text-red-300">Les mots de passe doivent être identiques.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled || mutation.isPending}
          className="w-full rounded bg-zinc-100 py-2 font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? 'Mise à jour…' : 'Valider'}
        </button>
      </form>

      <p className="mt-4 text-center text-zinc-400">
        Vous avez retrouvé votre mot de passe ?{' '}
        <Link to="/login" className="text-zinc-200 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}

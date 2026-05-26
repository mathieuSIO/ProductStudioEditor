import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { requestPasswordReset } from '../api/authApi'
import { AuthFormShell } from '../components/AuthFormShell'

const successMessage =
  'Si un compte existe pour cet email, un lien de reinitialisation a ete envoye.'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setIsLoading(true)

    try {
      await requestPasswordReset({ email })
      setIsSuccess(true)
    } catch {
      setError('La demande de reinitialisation est momentanement indisponible.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFormShell
      error={error}
      footer={
        <>
          Vous connaissez votre mot de passe ?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-950 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
          >
            Se connecter
          </Link>
        </>
      }
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitLabel="Envoyer le lien"
      subtitle="Recevez un lien securise pour choisir un nouveau mot de passe."
      title="Mot de passe oublie"
    >
      <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
        Email
        <input
          autoComplete="email"
          className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>

      {isSuccess ? (
        <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
          {successMessage}
        </div>
      ) : null}
    </AuthFormShell>
  )
}

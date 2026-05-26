import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { resetPassword } from '../api/authApi'
import { AuthFormShell } from '../components/AuthFormShell'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(
    token ? null : 'Le lien de reinitialisation est invalide ou incomplet.',
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setError('Le lien de reinitialisation est invalide ou incomplet.')
      return
    }

    if (password !== passwordConfirmation) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await resetPassword({ password, token })
      setIsSuccess(true)
      setPassword('')
      setPasswordConfirmation('')
    } catch {
      setError(
        "Le mot de passe n'a pas pu etre reinitialise. Le lien est peut-etre expire.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFormShell
      error={error}
      footer={
        <>
          Retour a la connexion ?{' '}
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
      submitLabel="Reinitialiser le mot de passe"
      subtitle="Choisissez un nouveau mot de passe pour votre espace client."
      title="Nouveau mot de passe"
    >
      <FormField
        autoComplete="new-password"
        disabled={isSuccess || !token}
        label="Nouveau mot de passe"
        name="password"
        onChange={setPassword}
        value={password}
      />
      <FormField
        autoComplete="new-password"
        disabled={isSuccess || !token}
        label="Confirmer le mot de passe"
        name="passwordConfirmation"
        onChange={setPasswordConfirmation}
        value={passwordConfirmation}
      />

      {isSuccess ? (
        <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
          Votre mot de passe a ete reinitialise. Vous pouvez maintenant vous
          connecter.
        </div>
      ) : null}
    </AuthFormShell>
  )
}

type FormFieldProps = {
  autoComplete: string
  disabled: boolean
  label: string
  name: string
  onChange: (value: string) => void
  value: string
}

function FormField({
  autoComplete,
  disabled,
  label,
  name,
  onChange,
  value,
}: FormFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
      {label}
      <input
        autoComplete={autoComplete}
        className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
        disabled={disabled}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required
        type="password"
        value={value}
      />
    </label>
  )
}

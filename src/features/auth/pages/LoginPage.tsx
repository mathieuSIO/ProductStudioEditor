import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthFormShell } from '../components/AuthFormShell'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { error, isLoading, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await login({ email, password })
      navigate(getRedirectPath(location.state), { replace: true })
    } catch {
      // L'erreur affichée est centralisée dans useAuth.
    }
  }

  return (
    <AuthFormShell
      error={error}
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-950 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
          >
            Créer un compte
          </Link>
        </>
      }
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitLabel="Se connecter"
      subtitle="Connectez-vous pour retrouver vos commandes et leur suivi."
      title="Connexion"
    >
      <FormField
        autoComplete="email"
        label="Email"
        name="email"
        onChange={setEmail}
        type="email"
        value={email}
      />
      <FormField
        autoComplete="current-password"
        label="Mot de passe"
        name="password"
        onChange={setPassword}
        type="password"
        value={password}
      />
    </AuthFormShell>
  )
}

type FormFieldProps = {
  autoComplete: string
  label: string
  name: string
  onChange: (value: string) => void
  type: 'email' | 'password'
  value: string
}

function FormField({
  autoComplete,
  label,
  name,
  onChange,
  type,
  value,
}: FormFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
      {label}
      <input
        autoComplete={autoComplete}
        className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
    </label>
  )
}

function getRedirectPath(state: unknown): string {
  if (!isRecord(state) || typeof state.from !== 'string') {
    return '/account'
  }

  return state.from.startsWith('/') ? state.from : '/account'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

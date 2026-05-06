import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthFormShell } from '../components/AuthFormShell'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { error, isLoading, register } = useAuth()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await register({ email, firstName, lastName, password })
      navigate('/account', { replace: true })
    } catch {
      // L'erreur affichée est centralisée dans useAuth.
    }
  }

  return (
    <AuthFormShell
      error={error}
      footer={
        <>
          Déjà inscrit ?{' '}
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
      submitLabel="Créer mon compte"
      subtitle="Créez votre accès client pour suivre vos commandes MPM."
      title="Créer un compte"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          label="Prénom"
          name="firstName"
          onChange={setFirstName}
          type="text"
          value={firstName}
        />
        <FormField
          autoComplete="family-name"
          label="Nom"
          name="lastName"
          onChange={setLastName}
          type="text"
          value={lastName}
        />
      </div>
      <FormField
        autoComplete="email"
        label="Email"
        name="email"
        onChange={setEmail}
        type="email"
        value={email}
      />
      <FormField
        autoComplete="new-password"
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
  type: 'email' | 'password' | 'text'
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

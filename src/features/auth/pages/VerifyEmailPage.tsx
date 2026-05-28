import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  resendVerificationEmail,
  verifyEmail,
} from '../api/authApi'
import { useAuth } from '../hooks/useAuth'

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { user } = useAuth()
  const [status, setStatus] = useState<VerificationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState(user?.email ?? '')
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const hasVerifiedRef = useRef(false)
  const hasSucceededRef = useRef(false)
  const isAlreadyVerified = user?.emailVerified === true

  useEffect(() => {
    async function verifyToken() {
      if (hasVerifiedRef.current) {
        return
      }

      hasVerifiedRef.current = true

      if (isAlreadyVerified) {
        hasSucceededRef.current = true
        setStatus('success')
        return
      }

      if (!token) {
        setStatus('error')
        setError('Ce lien de verification est invalide ou expire.')
        return
      }

      setStatus('loading')
      setError(null)

      try {
        await verifyEmail(token)
        hasSucceededRef.current = true
        setStatus('success')
      } catch {
        if (!hasSucceededRef.current) {
          setStatus('error')
          setError('Ce lien de verification est invalide ou expire.')
        }
      }
    }

    void verifyToken()
  }, [isAlreadyVerified, token])

  async function handleResendSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResendError(null)
    setResendSuccess(null)
    setIsResending(true)

    try {
      await resendVerificationEmail({ email })
      setResendSuccess(
        "Si ce compte existe, un nouvel email de verification vient d'etre envoye.",
      )
    } catch (resendSubmitError) {
      setResendError(
        resendSubmitError instanceof Error
          ? resendSubmitError.message
          : "L'email de verification n'a pas pu etre renvoye.",
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="min-h-screen bg-blue-50/55 px-4 py-6 text-blue-950">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[1.35rem] border border-stone-200 bg-white shadow-[0_22px_58px_-42px_rgba(15,23,42,0.45)] lg:grid-cols-[0.85fr_1fr]">
          <div className="bg-blue-950 px-6 py-8 text-white sm:px-8 lg:py-10">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white"
                aria-label="Retour au studio"
              >
                <img
                  src="/logo-mpm.png"
                  alt="Mon Petit Matos"
                  className="h-full w-full object-contain"
                />
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center justify-center rounded-[0.9rem] border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Connexion
              </Link>
            </div>
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
              Mon Petit Matos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Verification email
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">
              Confirmez votre adresse email pour securiser votre espace client
              et le suivi de vos commandes.
            </p>
          </div>

          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Compte client
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950">
              Verification de votre adresse
            </h2>

            <VerificationMessage
              error={error}
              isAlreadyVerified={isAlreadyVerified}
              status={status}
            />

            {status === 'error' ? (
              <form className="mt-6 grid gap-4" onSubmit={handleResendSubmit}>
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

                <Feedback error={resendError} success={resendSuccess} />

                <button
                  type="submit"
                  className="rounded-[0.95rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                  disabled={isResending}
                >
                  {isResending
                    ? 'Envoi en cours...'
                    : "Renvoyer l'email de verification"}
                </button>
              </form>
            ) : null}

            <div className="mt-5 text-sm text-stone-600">
              <Link
                to="/login"
                className="font-semibold text-blue-950 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
              >
                Retour connexion
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

type VerificationMessageProps = {
  error: string | null
  isAlreadyVerified: boolean
  status: VerificationStatus
}

function VerificationMessage({
  error,
  isAlreadyVerified,
  status,
}: VerificationMessageProps) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="mt-6 rounded-[1rem] border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-medium text-stone-600">
        Verification de votre lien en cours...
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="mt-6 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-800">
        {isAlreadyVerified
          ? 'Votre adresse email est deja verifiee.'
          : 'Votre adresse email a bien ete verifiee.'}
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-[1rem] border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">
      {error ?? 'Ce lien de verification est invalide ou expire.'}
    </div>
  )
}

type FeedbackProps = {
  error: string | null
  success: string | null
}

function Feedback({ error, success }: FeedbackProps) {
  if (error) {
    return (
      <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
        {error}
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
        {success}
      </div>
    )
  }

  return null
}

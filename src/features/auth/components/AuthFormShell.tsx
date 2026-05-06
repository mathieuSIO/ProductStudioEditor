import type { FormEvent, PropsWithChildren, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthFormShellProps = PropsWithChildren<{
  error: string | null
  footer: ReactNode
  isLoading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  submitLabel: string
  subtitle: string
  title: string
}>

export function AuthFormShell({
  children,
  error,
  footer,
  isLoading,
  onSubmit,
  submitLabel,
  subtitle,
  title,
}: AuthFormShellProps) {
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
                to="/"
                className="inline-flex min-h-10 items-center justify-center rounded-[0.9rem] border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Retour au studio
              </Link>
            </div>
            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
              Mon Petit Matos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Espace client
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">
              Retrouvez vos commandes, vos informations et le suivi de vos
              projets textile personnalisés.
            </p>
          </div>

          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Connexion sécurisée
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {subtitle}
              </p>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
              {children}

              {error ? (
                <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="rounded-[0.95rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                disabled={isLoading}
              >
                {isLoading ? 'Traitement en cours...' : submitLabel}
              </button>
            </form>

            <div className="mt-5 text-sm text-stone-600">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  )
}

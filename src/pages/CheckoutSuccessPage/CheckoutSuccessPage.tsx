import { Link } from 'react-router-dom'

export function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-blue-50/55 px-4 py-6 text-blue-950">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-3xl place-items-center">
        <div className="w-full rounded-[1.25rem] border border-emerald-200 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.35)]">
          <div className="rounded-[1.1rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Paiement
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Paiement en cours de confirmation
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6">
              Merci, votre paiement a bien ete transmis. La confirmation finale
              est geree par Stripe et peut prendre quelques secondes a
              apparaitre dans votre espace client.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/account"
              className="inline-flex min-h-11 items-center justify-center rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              Voir mes commandes
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              Retour au studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

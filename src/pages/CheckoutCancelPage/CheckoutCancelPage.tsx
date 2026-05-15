import { Link } from 'react-router-dom'

export function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-blue-50/55 px-4 py-6 text-blue-950">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-3xl place-items-center">
        <div className="w-full rounded-[1.25rem] border border-blue-100 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.35)]">
          <div className="rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Paiement annule
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Le paiement n'a pas ete finalise
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6">
              Votre panier n'est pas vide par cette page. Vous pouvez revenir au
              studio pour reprendre votre panier ou relancer le checkout.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/?view=cart"
              className="inline-flex min-h-11 items-center justify-center rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Revenir au panier
            </Link>
            <Link
              to="/account"
              className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              Voir mes commandes
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

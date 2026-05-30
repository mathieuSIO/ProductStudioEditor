import { useNavigate } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { useAuth } from '../../auth'

const adminSections = [
  {
    title: 'Commandes',
    description: 'Gerez les commandes clients',
    helper: 'Consultez les commandes, leurs details et leur statut de production.',
    actionLabel: 'Ouvrir les commandes',
    to: '/admin/orders',
  },
  {
    title: 'Demandes personnalisees',
    description: 'Traitez les demandes personnalisees',
    helper: 'Lisez les briefs clients et mettez a jour leur avancement.',
    actionLabel: 'Ouvrir les demandes',
    to: '/admin/custom-requests',
  },
  {
    title: 'Codes promo',
    description: 'Gerez les reductions',
    helper: 'Creez les codes promo et activez ou desactivez leur utilisation.',
    actionLabel: 'Ouvrir les codes promo',
    to: '/admin/promo-codes',
  },
  {
    title: 'Suivi / expeditions',
    description: 'Ajoutez les numeros de suivi depuis les details commande',
    helper: 'Le tracking transport est gere dans chaque detail commande.',
    actionLabel: 'Gerer le suivi',
    to: '/admin/orders',
  },
] as const

export function AdminHomePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="grid min-w-0 gap-4">
      <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Administration
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              Administration MPM
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Accedez aux outils de gestion du studio Mon Petit Matos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/')}
            >
              Studio
            </button>
            <button
              type="button"
              className="rounded-[0.95rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              onClick={handleLogout}
            >
              Deconnexion
            </button>
          </div>
        </div>
      </div>

      <PanelCard
        eyebrow="Back office"
        title="Fonctionnalites admin"
        description="Choisissez l'espace a ouvrir pour gerer les operations courantes."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {adminSections.map((section) => (
            <article
              key={section.title}
              className="flex min-h-[13rem] flex-col rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4"
            >
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-blue-950">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-5 text-emerald-800">
                  {section.description}
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {section.helper}
                </p>
              </div>
              <button
                type="button"
                className="mt-auto rounded-[0.95rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                onClick={() => navigate(section.to)}
              >
                {section.actionLabel}
              </button>
            </article>
          ))}
        </div>
      </PanelCard>
    </section>
  )
}

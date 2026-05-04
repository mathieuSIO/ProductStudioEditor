type AccountSidebarProps = {
  onReturnToStudio: () => void
}

const accountLinks = ['Mes commandes', 'Mes informations', 'Aide projet']

export function AccountSidebar({ onReturnToStudio }: AccountSidebarProps) {
  return (
    <aside className="rounded-[1.25rem] border border-stone-200 bg-white p-3 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.28)] lg:sticky lg:top-4 lg:h-fit">
      <div className="rounded-[1rem] bg-blue-950 px-4 py-4 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">
          Mon compte
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          Espace client
        </h2>
        <p className="mt-2 text-sm leading-5 text-blue-100">
          Suivez vos commandes textile et retrouvez les détails de production.
        </p>
      </div>

      <nav className="mt-3 grid gap-1.5" aria-label="Navigation compte">
        {accountLinks.map((link, index) => (
          <button
            key={link}
            type="button"
            className={`flex items-center justify-between rounded-[0.9rem] px-3 py-2.5 text-left text-sm font-semibold transition ${
              index === 0
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
                : 'text-blue-900 hover:bg-blue-50'
            }`}
            disabled={index !== 0}
          >
            <span>{link}</span>
            {index === 0 ? (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ) : null}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="mt-3 w-full rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-red-200 hover:bg-white hover:text-red-600"
        onClick={onReturnToStudio}
      >
        Retour au studio
      </button>
    </aside>
  )
}

type HeaderCartButtonProps = {
  isCartOpen?: boolean
  itemCount: number
  onClick: () => void
}

export function HeaderCartButton({
  isCartOpen = false,
  itemCount,
  onClick,
}: HeaderCartButtonProps) {
  const label = isCartOpen ? 'Studio' : `Panier (${itemCount})`
  const ariaLabel = isCartOpen
    ? 'Retourner au studio'
    : `Ouvrir le panier, ${itemCount} configuration${
        itemCount > 1 ? 's' : ''
      }`

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.75)] transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
      onClick={onClick}
    >
      <span>{label}</span>
      {!isCartOpen ? (
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white ring-1 ring-white/20">
          {itemCount}
        </span>
      ) : null}
    </button>
  )
}

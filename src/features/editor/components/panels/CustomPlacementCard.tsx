type CustomPlacementCardProps = {
  productName: string
  value: string
  onChange: (value: string) => void
}

const suggestionLabels = ['Manche', 'Dos bas', 'Côté cœur', 'Col / nuque']

export function CustomPlacementCard({
  productName,
  value,
  onChange,
}: CustomPlacementCardProps) {
  const isEmpty = value.trim().length === 0

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-2 sm:py-4">
      <div className="w-full rounded-[1.4rem] border border-blue-100 bg-white px-5 py-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)] sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-3 border-b border-blue-100 pb-4">
          <div className="min-w-0">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Demande personnalisée
            </span>
            <h3 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-blue-950 sm:text-[1.25rem]">
              Décrivez votre besoin
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
              Indiquez où et comment vous souhaitez personnaliser votre produit.
            </p>
          </div>

          <div className="hidden rounded-[1rem] border border-blue-100 bg-blue-50 px-3 py-2 text-right sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              Produit
            </p>
            <p className="mt-1 text-sm font-semibold text-blue-950">
              {productName}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="block">
            <span className="sr-only">
              Description de la demande personnalisée
            </span>
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              rows={7}
              placeholder={`Exemple :\n- logo sur manche gauche\n- impression en bas du dos\n- broderie côté cœur\n- texte sur la nuque`}
              className="min-h-[150px] w-full resize-none rounded-[1.1rem] border border-blue-100 bg-blue-50/45 px-4 py-3 text-sm leading-6 text-blue-950 outline-none transition-colors placeholder:text-blue-400 focus:border-red-400 focus:bg-white"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestionLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700"
              >
                {label}
              </span>
            ))}
          </div>

          {isEmpty ? (
            <div className="mt-4 rounded-[1rem] border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
              Donnez un maximum de contexte utile : emplacement souhaité, type
              de marquage, taille approximative ou intention particulière.
            </div>
          ) : (
            <div className="mt-4 rounded-[1rem] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              Brief enregistré. Vous pouvez revenir sur Avant ou Arrière sans
              perdre cette demande.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

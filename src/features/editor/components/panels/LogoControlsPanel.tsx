import type { LogoManualControls, PrintFormat } from '../../types'

type LogoControlsPanelProps = {
  controls: LogoManualControls | null
  onChange: (controls: LogoManualControls) => void
  printFormat: PrintFormat | null
}

export function LogoControlsPanel({
  controls,
  onChange,
  printFormat,
}: LogoControlsPanelProps) {
  if (!controls) {
    return (
      <div className="rounded-[1rem] border border-stone-200 bg-stone-50/80 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Reglages du logo
          </p>
          <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            En attente
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-5 text-stone-500">
          Les reglages manuels apparaitront ici des qu&apos;un element actif sera
          selectionne dans le configurateur.
        </p>
        <div className="mt-2.5 rounded-[0.95rem] border border-dashed border-stone-300 bg-white/80 px-3 py-3.5 text-sm leading-5 text-stone-400">
          Aucun element actif pour le moment.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[1rem] border border-stone-200 bg-stone-50/80 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Reglages du logo
          </p>
          <p className="mt-1.5 text-sm leading-5 text-stone-500">
            Modifie la position et la taille avec des valeurs simples,
            synchronisees avec la preview.
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          Manuel
        </span>
      </div>

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        <NumericField
          label="Position horizontale"
          value={controls.x}
          onChange={(value) => onChange({ ...controls, x: value })}
        />
        <NumericField
          label="Position verticale"
          value={controls.y}
          onChange={(value) => onChange({ ...controls, y: value })}
        />
      </div>

      <div className="mt-2.5">
        <NumericField
          label="Taille du logo"
          value={controls.width}
          onChange={(value) => onChange({ ...controls, width: value })}
        />
      </div>

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Format impression
          </p>
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-600">
            Auto
          </span>
        </div>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <p className="text-sm text-stone-500">Derive de la largeur du logo</p>
          <p className="text-lg font-semibold tracking-tight text-stone-900">
            {printFormat ?? 'A4'}
          </p>
        </div>
      </div>

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-white/90 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          Synchronisation
        </p>
        <p className="mt-1.5 text-sm leading-5 text-stone-500">
          Le format d&apos;impression suit automatiquement la taille visuelle du
          logo apres un glisser-deposer ou un redimensionnement.
        </p>
      </div>
    </div>
  )
}

type NumericFieldProps = {
  label: string
  onChange: (value: number) => void
  value: number
}

function NumericField({ label, onChange, value }: NumericFieldProps) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5">
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={Math.round(value)}
          onChange={(event) => {
            const nextValue = Number(event.target.value)

            if (Number.isNaN(nextValue)) {
              return
            }

            onChange(nextValue)
          }}
          className="w-full border-none bg-transparent text-sm font-medium text-stone-800 outline-none"
        />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
          %
        </span>
      </div>
    </label>
  )
}

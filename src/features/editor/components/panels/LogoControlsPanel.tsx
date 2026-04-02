import { defaultLogoSizePercent } from '../../constants/logoPlacement'
import type { LogoManualControls } from '../../types'

type LogoControlsPanelProps = {
  controls: LogoManualControls | null
  logoAspectRatio?: number
  onChange: (controls: LogoManualControls) => void
}

export function LogoControlsPanel({
  controls,
  logoAspectRatio = 1,
  onChange,
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

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-white/90 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Actions rapides
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            1 clic
          </span>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2">
          <QuickActionButton
            label="Centrer"
            description="Replace le logo au centre de la zone."
            onClick={() =>
              onChange(getCenteredControls(controls, logoAspectRatio))
            }
          />
          <QuickActionButton
            label="Reinitialiser position"
            description="Conserve la taille actuelle et remet le placement par defaut."
            onClick={() => onChange(getResetPositionControls(controls))}
          />
          <QuickActionButton
            label="Taille recommandee"
            description="Applique une largeur confortable pour repartir proprement."
            onClick={() =>
              onChange({
                ...controls,
                width: defaultLogoSizePercent,
              })
            }
          />
        </div>
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

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-white/90 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          Synchronisation
        </p>
        <p className="mt-1.5 text-sm leading-5 text-stone-500">
          Les valeurs se mettent a jour automatiquement apres un glisser-deposer
          ou un redimensionnement dans la preview.
        </p>
      </div>
    </div>
  )
}

type QuickActionButtonProps = {
  description: string
  label: string
  onClick: () => void
}

function QuickActionButton({
  description,
  label,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-2 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
    >
      <p className="text-sm font-medium text-stone-800">{label}</p>
      <p className="mt-0.5 text-[12px] leading-5 text-stone-500">
        {description}
      </p>
    </button>
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

function getCenteredControls(
  controls: LogoManualControls,
  logoAspectRatio: number,
): LogoManualControls {
  const safeAspectRatio = logoAspectRatio > 0 ? logoAspectRatio : 1
  const height = controls.width / safeAspectRatio

  return {
    ...controls,
    x: (100 - controls.width) / 2,
    y: (100 - height) / 2,
  }
}

function getResetPositionControls(
  controls: LogoManualControls,
): LogoManualControls {
  const defaultOffset = (100 - defaultLogoSizePercent) / 2

  return {
    ...controls,
    x: defaultOffset,
    y: defaultOffset,
  }
}

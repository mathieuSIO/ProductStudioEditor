import { useId, useRef } from 'react'

import { acceptedLogoMimeTypes } from '../../constants/logoUpload'
import type { DesignElement, EditorElementId, UploadedLogo } from '../../types'

type LogoUploadPanelProps = {
  errorMessage: string | null
  logos: DesignElement[]
  logo: UploadedLogo | null
  onFileSelect: (file: File | null) => void
  onRemove: () => void
  onSelect: (elementId: EditorElementId | null) => void
  selectedElementId: EditorElementId | null
}

export function LogoUploadPanel({
  errorMessage,
  logos,
  logo,
  onFileSelect,
  onRemove,
  onSelect,
  selectedElementId,
}: LogoUploadPanelProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    onFileSelect(file)
    event.target.value = ''
  }

  function openFileDialog() {
    inputRef.current?.click()
  }

  return (
    <div className="rounded-[1.15rem] border border-stone-200 bg-stone-50/80 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Logo
          </p>
          <p className="mt-1.5 text-sm leading-5 text-stone-500">
            Importe un visuel pour preparer son affichage dans la zone
            imprimable.
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          PNG JPG SVG PDF
        </span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={acceptedLogoMimeTypes.join(',')}
        className="sr-only"
        onChange={handleChange}
      />

      {logo ? (
        <div className="mt-2.5 rounded-[1rem] border border-stone-200 bg-white px-3 py-2.5">
          <p className="text-sm font-medium text-stone-800">{logo.name}</p>
          <p className="mt-1 text-sm text-stone-500">{logo.mimeType}</p>
          {logo.width && logo.height ? (
            <p className="mt-1 text-sm text-stone-500">
              {logo.width} x {logo.height} px
            </p>
          ) : null}
          <p className="mt-1 text-sm text-stone-500">
            {formatFileSize(logo.size)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openFileDialog}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400"
            >
              Remplacer
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300"
            >
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-[1rem] border border-dashed border-stone-300 bg-white px-3 py-6 text-center transition-colors hover:border-stone-400"
        >
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            Aucun fichier
          </span>
          <span className="mt-2.5 text-sm font-medium text-stone-700">
            Selectionner un logo
          </span>
          <span className="mt-1 text-sm leading-5 text-stone-500">
            Formats acceptes : png, jpg, jpeg, svg et pdf.
          </span>
        </label>
      )}

      {errorMessage ? (
        <p className="mt-2.5 rounded-[0.95rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {logos.length > 0 ? (
        <div className="mt-2.5 rounded-[1rem] border border-stone-200 bg-white/90 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Logos sur cette vue
            </p>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              {logos.length}
            </span>
          </div>

          <div className="mt-2 grid gap-1.5">
            {logos.map((logoElement, index) => {
              const isSelected = selectedElementId === logoElement.id

              return (
                <button
                  key={logoElement.id}
                  type="button"
                  onClick={() => onSelect(logoElement.id)}
                  aria-pressed={isSelected}
                  className={`rounded-[0.95rem] border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {logoElement.asset.name}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] ${
                          isSelected ? 'text-white/72' : 'text-stone-500'
                        }`}
                      >
                        Logo {index + 1}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        isSelected
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-500'
                      }`}
                    >
                      {isSelected ? 'Actif' : 'Choisir'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} Ko`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`
}

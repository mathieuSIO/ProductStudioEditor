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

  function stopLogoActionPropagation(event: React.SyntheticEvent) {
    event.stopPropagation()
  }

  return (
    <div className="w-full max-w-full min-w-0 rounded-[0.95rem] border border-blue-100 bg-white py-2 pl-2 pr-1">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
            Fichier logo
          </p>
          {!logo ? (
            <p className="mt-1 text-sm leading-5 text-stone-500">
              Ajoutez votre logo, nous gardons le placement modifiable sur le
              mockup.
            </p>
          ) : null}
        </div>
        <span className="max-w-[6.5rem] shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
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
        <div
          data-editor-selection-safe="true"
          className="mt-2 w-full max-w-full min-w-0 rounded-[0.95rem] border border-blue-100 bg-blue-50 py-2 pl-2 pr-1"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-blue-950">
                {logo.name}
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                {formatFileSize(logo.size)}
                {logo.width && logo.height
                  ? ` · ${logo.width} x ${logo.height} px`
                  : ''}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600">
              Importé
            </span>
          </div>

          <div className="mt-2 flex max-w-full flex-wrap gap-2">
            <button
              type="button"
              onPointerDown={stopLogoActionPropagation}
              onClick={(event) => {
                stopLogoActionPropagation(event)
                openFileDialog()
              }}
              className="rounded-full border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-900 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              Remplacer
            </button>
            <button
              type="button"
              onPointerDown={stopLogoActionPropagation}
              onClick={(event) => {
                stopLogoActionPropagation(event)
                onRemove()
              }}
              className="rounded-full border border-red-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
            >
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-[0.95rem] border border-dashed border-blue-200 bg-blue-50 px-3 py-5 text-center transition-colors hover:border-red-300 hover:bg-white"
        >
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
            Aucun fichier
          </span>
          <span className="mt-2.5 text-sm font-semibold text-blue-950">
            Sélectionner un logo
          </span>
          <span className="mt-1 text-sm leading-5 text-stone-500">
            Formats acceptés : png, jpg, jpeg, svg et pdf.
          </span>
        </label>
      )}

      {errorMessage ? (
        <p className="mt-2 rounded-[0.9rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {logos.length > 0 ? (
        <div className="mt-2 w-full max-w-full min-w-0 rounded-[0.95rem] border border-blue-100 bg-white p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              Logos sur cette vue
            </p>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
              {logos.length}
            </span>
          </div>

          <div className="mt-2 grid min-w-0 gap-1.5">
            {logos.map((logoElement, index) => {
              const isSelected = selectedElementId === logoElement.id

              return (
                <button
                  key={logoElement.id}
                  type="button"
                  onClick={() => onSelect(logoElement.id)}
                  aria-pressed={isSelected}
                  className={`w-full max-w-full min-w-0 rounded-[0.9rem] border py-1.5 pl-2 pr-1 text-left transition-colors ${
                    isSelected
                      ? 'border-blue-950 bg-blue-950 text-white'
                      : 'border-blue-100 bg-blue-50 text-blue-950 hover:border-blue-200 hover:bg-white'
                  }`}
                >
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold">
                        {logoElement.asset.name}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] ${
                          isSelected ? 'text-white/72' : 'text-blue-700'
                        }`}
                      >
                        Logo {index + 1}
                      </p>
                    </div>

                    <span
                        className={`shrink-0 self-start rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        isSelected
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-red-100 bg-white text-red-600'
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

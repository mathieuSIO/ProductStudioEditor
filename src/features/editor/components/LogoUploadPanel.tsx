import { useId, useRef } from 'react'

import { acceptedLogoMimeTypes } from '../constants/logoUpload'
import type { UploadedLogo } from '../types'

type LogoUploadPanelProps = {
  errorMessage: string | null
  logo: UploadedLogo | null
  onFileSelect: (file: File | null) => void
  onRemove: () => void
}

export function LogoUploadPanel({
  errorMessage,
  logo,
  onFileSelect,
  onRemove,
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
    </div>
  )
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} Ko`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`
}

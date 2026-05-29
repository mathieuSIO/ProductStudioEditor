import { env } from '../../../shared/config/env'
import type { FinalPreviewUrls } from '../../../shared/utils/previewImages'
import type { OrderItemDetails } from '../../account'

type AdminOrderFilesPanelProps = {
  items: OrderItemDetails[]
}

type ClientFile = {
  id: string
  itemName: string
  mimeType: string | null
  name: string
  previewUrl: string | null
  printFormat: string | null
  sizeBytes: number | null
  type: 'logo' | 'final-preview'
  viewId: string
}

const viewLabels: Record<string, string> = {
  back: 'Dos',
  custom: 'Personnalisee',
  front: 'Devant',
}

export function AdminOrderFilesPanel({ items }: AdminOrderFilesPanelProps) {
  const files = collectClientFiles(items)

  return (
    <div className="grid gap-3">
      {files.length === 0 ? (
        <div className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm font-medium text-stone-600">
          Aucun fichier client disponible pour cette commande.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <ClientFileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClientFileCard({ file }: { file: ClientFile }) {
  const resolvedUrl = file.previewUrl ? resolveUploadUrl(file.previewUrl) : null
  const fileLabel =
    file.type === 'final-preview' ? 'Preview finale' : 'Logo client'

  return (
    <article className="grid gap-3 rounded-[1rem] border border-stone-200 bg-stone-50 p-3">
      <div className="overflow-hidden rounded-[0.9rem] border border-stone-200 bg-white">
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt={file.name}
            className="aspect-[4/3] w-full object-contain"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center px-3 text-center text-sm font-semibold text-stone-400">
            Apercu indisponible
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {fileLabel}
        </p>
        <h3 className="mt-1 break-words text-sm font-semibold text-blue-950">
          {file.name}
        </h3>
        <p className="mt-1 break-words text-xs font-medium text-stone-500">
          {file.itemName}
        </p>
      </div>

      <dl className="grid gap-2 text-xs text-stone-600">
        <FileMeta label="Vue" value={formatViewLabel(file.viewId)} />
        <FileMeta label="Format impression" value={file.printFormat ?? '-'} />
        <FileMeta label="Type MIME" value={file.mimeType ?? '-'} />
        <FileMeta label="Taille" value={formatFileSize(file.sizeBytes)} />
      </dl>

      {resolvedUrl ? (
        <div className="flex flex-wrap gap-2">
          <a
            className="rounded-[0.85rem] border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
            href={resolvedUrl}
            rel="noreferrer"
            target="_blank"
          >
            Ouvrir
          </a>
          <a
            className="rounded-[0.85rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            download={file.name}
            href={resolvedUrl}
          >
            Telecharger
          </a>
        </div>
      ) : null}
    </article>
  )
}

function FileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-3 rounded-[0.8rem] bg-white px-3 py-2">
      <dt className="shrink-0 font-semibold text-stone-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold text-blue-950">
        {value}
      </dd>
    </div>
  )
}

function collectClientFiles(items: OrderItemDetails[]): ClientFile[] {
  return items.flatMap((item) => [
    ...collectLogoFiles(item),
    ...collectFinalPreviewFiles(item),
  ])
}

function collectLogoFiles(item: OrderItemDetails): ClientFile[] {
  const design = readDesign(item.customization)
  const views = readRecordArray(design, 'views')

  return views.flatMap((view, viewIndex) => {
    const viewId = readString(view, 'viewId') ?? `view-${viewIndex + 1}`
    const logos = readRecordArray(view, 'logos')

    return logos.map((logo, logoIndex) => {
      const name =
        readString(logo, 'name') ?? `Logo ${logoIndex + 1} - ${formatViewLabel(viewId)}`

      return {
        id:
          readString(logo, 'id') ??
          `${item.id}-${viewId}-logo-${logoIndex + 1}`,
        itemName: item.productName,
        mimeType: readString(logo, 'mimeType'),
        name,
        previewUrl: readString(logo, 'previewUrl'),
        printFormat: readString(logo, 'printFormat'),
        sizeBytes: readNumber(logo, 'originalFileSize'),
        type: 'logo',
        viewId,
      }
    })
  })
}

function collectFinalPreviewFiles(item: OrderItemDetails): ClientFile[] {
  const urls =
    readFinalPreviewUrlsFromCustomization(item.customization) ??
    item.finalPreviewUrls ??
    null

  if (!urls) {
    return []
  }

  return (['front', 'back', 'custom'] as const)
    .map<ClientFile | null>((viewId) => {
      const previewUrl = urls[viewId]

      if (!previewUrl) {
        return null
      }

      return {
        id: `${item.id}-final-preview-${viewId}`,
        itemName: item.productName,
        mimeType: null,
        name: `Preview finale ${formatViewLabel(viewId)}`,
        previewUrl,
        printFormat: null,
        sizeBytes: null,
        type: 'final-preview',
        viewId,
      }
    })
    .filter(isClientFile)
}

function readDesign(
  customization: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  return readRecord(customization, 'design')
}

function readFinalPreviewUrlsFromCustomization(
  customization: Record<string, unknown> | null | undefined,
): FinalPreviewUrls | null {
  const design = readDesign(customization)
  const finalPreviewUrls = readRecord(design, 'finalPreviewUrls')

  if (!finalPreviewUrls) {
    return null
  }

  return {
    back: readString(finalPreviewUrls, 'back') ?? undefined,
    custom: readString(finalPreviewUrls, 'custom') ?? undefined,
    front: readString(finalPreviewUrls, 'front') ?? undefined,
  }
}

function resolveUploadUrl(url: string): string {
  if (url.startsWith('/uploads')) {
    return `${env.apiBaseUrl}${url}`
  }

  if (!url.startsWith('http')) {
    return url
  }

  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.hostname !== 'localhost' || parsedUrl.port !== '4000') {
      return url
    }

    const apiBaseUrl = new URL(env.apiBaseUrl)
    parsedUrl.protocol = apiBaseUrl.protocol
    parsedUrl.host = apiBaseUrl.host

    return parsedUrl.toString()
  } catch {
    return url
  }
}

function formatViewLabel(viewId: string): string {
  return viewLabels[viewId] ?? viewId
}

function formatFileSize(sizeBytes: number | null): string {
  if (sizeBytes === null) {
    return '-'
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} o`
  }

  const sizeKilobytes = sizeBytes / 1024

  if (sizeKilobytes < 1024) {
    return `${sizeKilobytes.toFixed(1)} Ko`
  }

  return `${(sizeKilobytes / 1024).toFixed(1)} Mo`
}

function readRecord(
  record: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> | null {
  const value = record?.[key]

  return isRecord(value) ? value : null
}

function readRecordArray(
  record: Record<string, unknown> | null,
  key: string,
): Record<string, unknown>[] {
  const value = record?.[key]

  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isRecord)
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]

  return typeof value === 'number' ? value : null
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function isClientFile(value: ClientFile | null): value is ClientFile {
  return value !== null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

import { createAuthHeaders, getStoredAuthToken } from '../../auth'
import { env } from '../../../shared/config/env'

export type UploadedFinalPreviewFile = {
  mimeType: string
  originalFileName: string
  size: number
  storageKey: string
  url: string
}

type UploadFinalPreviewResponse = {
  data: UploadedFinalPreviewFile
  success: true
}

export async function uploadFinalPreview(
  file: File,
): Promise<UploadedFinalPreviewFile> {
  const token = getStoredAuthToken()

  if (!token) {
    throw new Error("Connectez-vous pour enregistrer l'apercu final.")
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(getUploadFinalPreviewEndpoint(), {
    body: formData,
    headers: createAuthHeaders(),
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(
      `L'enregistrement de l'apercu final a echoue avec le statut ${response.status}.`,
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new Error("La reponse de l'upload d'apercu final est invalide.")
  }

  if (!isUploadFinalPreviewResponse(payload)) {
    throw new Error("La reponse de l'upload d'apercu final est invalide.")
  }

  return {
    ...payload.data,
    url: normalizeUploadedFileUrl(payload.data.url),
  }
}

function getUploadFinalPreviewEndpoint(): string {
  if (!env.apiBaseUrl) {
    throw new Error('La configuration API est manquante: VITE_API_BASE_URL.')
  }

  return `${env.apiBaseUrl.replace(/\/$/, '')}/api/uploads/final-previews`
}

function isUploadFinalPreviewResponse(
  value: unknown,
): value is UploadFinalPreviewResponse {
  if (!isRecord(value)) {
    return false
  }

  return value.success === true && isUploadedFinalPreviewFile(value.data)
}

function isUploadedFinalPreviewFile(
  value: unknown,
): value is UploadedFinalPreviewFile {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.url === 'string' &&
    typeof value.storageKey === 'string' &&
    typeof value.originalFileName === 'string' &&
    typeof value.mimeType === 'string' &&
    typeof value.size === 'number'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeUploadedFileUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`

  return `${env.apiBaseUrl.replace(/\/$/, '')}${normalizedPath}`
}

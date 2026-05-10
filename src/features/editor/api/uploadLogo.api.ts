import { createAuthHeaders, getStoredAuthToken } from '../../auth'
import { env } from '../../../shared/config/env'

export type UploadedLogoFile = {
  mimeType: string
  originalFileName: string
  size: number
  storageKey: string
  url: string
}

type UploadLogoResponse = {
  data: UploadedLogoFile
  success: true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUploadedLogoFile(value: unknown): value is UploadedLogoFile {
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

function isUploadLogoResponse(value: unknown): value is UploadLogoResponse {
  if (!isRecord(value)) {
    return false
  }

  return value.success === true && isUploadedLogoFile(value.data)
}

function getUploadLogoEndpoint(): string {
  if (!env.apiBaseUrl) {
    throw new Error('La configuration API est manquante: VITE_API_BASE_URL.')
  }

  return `${env.apiBaseUrl.replace(/\/$/, '')}/api/uploads/logos`
}

export async function uploadLogo(file: File): Promise<UploadedLogoFile> {
  const token = getStoredAuthToken()

  if (!token) {
    throw new Error('Connectez-vous pour envoyer votre logo au serveur.')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(getUploadLogoEndpoint(), {
    body: formData,
    headers: createAuthHeaders(),
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(
      `L'envoi du logo a echoue avec le statut ${response.status}.`,
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new Error("La reponse de l'upload logo est invalide.")
  }

  if (!isUploadLogoResponse(payload)) {
    throw new Error("La reponse de l'upload logo est invalide.")
  }

  return {
    ...payload.data,
    url: normalizeUploadedLogoUrl(payload.data.url),
  }
}

function normalizeUploadedLogoUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`

  return `${env.apiBaseUrl.replace(/\/$/, '')}${normalizedPath}`
}

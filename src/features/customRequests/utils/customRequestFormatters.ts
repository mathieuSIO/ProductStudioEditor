import type { CustomRequest, CustomRequestStatus } from '../types'

const frenchDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function formatCustomRequestCustomer(request: CustomRequest): string {
  const fullName = [
    request.customerFirstName,
    request.customerLastName,
  ].filter(Boolean).join(' ')

  return fullName.length > 0 ? fullName : 'Client MPM'
}

export function formatCustomRequestDate(value: string): string {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? 'Date non renseignee'
    : frenchDateFormatter.format(date)
}

export function formatCustomRequestStatus(
  status: CustomRequestStatus,
): string {
  const labels = {
    closed: 'Fermee',
    in_progress: 'En cours',
    new: 'Nouvelle',
    quoted: 'Devis envoye',
  } satisfies Record<CustomRequestStatus, string>

  return labels[status]
}

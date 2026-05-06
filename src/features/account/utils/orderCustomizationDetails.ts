import type { OrderItemDetails } from '../types/account.types'

export type CustomizationDetail = {
  label: string
  tone?: 'default' | 'success'
  value: string
}

export function getOrderItemCustomizationDetails(
  item: OrderItemDetails,
): CustomizationDetail[] {
  const customization = item.customization

  if (!customization) {
    return []
  }

  const product = readRecord(customization, 'product')
  const design = readRecord(customization, 'design')
  const pricing = readRecord(customization, 'pricing')
  const color = product ? readRecord(product, 'color') : null
  const quantities = product ? readRecord(product, 'quantities') : null
  const views = design ? readArray(design, 'views') : null
  const logos = collectLogos(views)
  const logoCount =
    readNumber(pricing, 'logosCount') ??
    readNumber(pricing, 'logos_count') ??
    logos.length
  const printingTechnique = readFirstString(customization, [
    'printingTechnique',
    'printing_technique',
    'printTechnique',
    'print_technique',
  ])
  const textValues = readTextValues(customization)
  const details: CustomizationDetail[] = []

  addDetail(details, 'Couleur', readString(color, 'label'))
  addDetail(details, 'Taille(s)', formatQuantities(quantities))
  addDetail(
    details,
    "Zone d'impression",
    formatPrintZones(views) ?? readString(design, 'customPlacement'),
  )
  addDetail(details, "Technique d'impression", printingTechnique)
  addDetail(details, "Format d'impression", formatPrintFormats(logos))
  addDetail(
    details,
    'Éléments personnalisés',
    logoCount > 0 ? formatCount(logoCount, 'élément') : null,
  )
  addDetail(details, 'Textes personnalisés', formatTextValues(textValues))
  addDetail(
    details,
    'Logo',
    logos.length > 0 ? formatLogoNames(logos) : null,
    'success',
  )

  if (hasProfessionalLogoReview(customization)) {
    addDetail(
      details,
      'Vérification professionnelle du logo',
      'Option choisie',
      'success',
    )
  }

  return details
}

export function hasProfessionalLogoReview(
  value: Record<string, unknown> | null | undefined,
): boolean {
  if (!value) {
    return false
  }

  const options =
    readRecord(value, 'options') ??
    readRecord(value, 'orderOptions') ??
    readRecord(value, 'order_options')

  return (
    readFirstBoolean(value, [
      'professionalLogoReview',
      'professional_logo_review',
      'logoReview',
      'logo_review',
    ]) ??
    (options
      ? readFirstBoolean(options, [
          'professionalLogoReview',
          'professional_logo_review',
          'logoReview',
          'logo_review',
        ])
      : false) ??
    false
  )
}

function addDetail(
  details: CustomizationDetail[],
  label: string,
  value: string | null,
  tone: CustomizationDetail['tone'] = 'default',
) {
  if (!value) {
    return
  }

  details.push({ label, tone, value })
}

function collectLogos(views: unknown[] | null): Record<string, unknown>[] {
  if (!views) {
    return []
  }

  return views.flatMap((view) => {
    if (!isRecord(view)) {
      return []
    }

    return readArray(view, 'logos')?.filter(isRecord) ?? []
  })
}

function formatPrintZones(views: unknown[] | null): string | null {
  if (!views) {
    return null
  }

  const zones = views
    .filter(isRecord)
    .map((view) => {
      const viewId = readString(view, 'viewId') ?? readString(view, 'view_id')
      const logosCount = readArray(view, 'logos')?.length ?? 0

      if (!viewId || logosCount === 0) {
        return null
      }

      return `${formatViewLabel(viewId)} (${formatCount(logosCount, 'logo')})`
    })
    .filter(isString)

  return zones.length > 0 ? zones.join(', ') : null
}

function formatPrintFormats(logos: Record<string, unknown>[]): string | null {
  const formats = uniqueStrings(
    logos
      .map((logo) => readString(logo, 'printFormat') ?? readString(logo, 'print_format'))
      .filter(isString),
  )

  return formats.length > 0 ? formats.join(', ') : null
}

function formatLogoNames(logos: Record<string, unknown>[]): string | null {
  if (logos.length === 0) {
    return null
  }

  const names = uniqueStrings(
    logos.map((logo) => readString(logo, 'name')).filter(isString),
  )

  if (names.length === 0) {
    return formatCount(logos.length, 'logo')
  }

  return names.join(', ')
}

function formatQuantities(
  quantities: Record<string, unknown> | null,
): string | null {
  if (!quantities) {
    return null
  }

  const entries = Object.entries(quantities)
    .filter(([, quantity]) => typeof quantity === 'number' && quantity > 0)
    .map(([size, quantity]) => `${size} : ${quantity}`)

  return entries.length > 0 ? entries.join(', ') : null
}

function formatTextValues(values: string[]): string | null {
  if (values.length === 0) {
    return null
  }

  return values.join(', ')
}

function readTextValues(record: Record<string, unknown>): string[] {
  const textKeys = ['texts', 'customTexts', 'custom_texts', 'textElements']

  return uniqueStrings(
    textKeys.flatMap((key) => readStringList(record[key])),
  )
}

function readStringList(value: unknown): string[] {
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()]
  }

  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (typeof item === 'string' && item.trim().length > 0) {
      return [item.trim()]
    }

    if (!isRecord(item)) {
      return []
    }

    return [
      readString(item, 'text'),
      readString(item, 'value'),
      readString(item, 'content'),
    ].filter(isString)
  })
}

function readFirstBoolean(
  record: Record<string, unknown>,
  keys: string[],
): boolean | null {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'boolean') {
      return value
    }
  }

  return null
}

function readFirstString(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = readString(record, key)

    if (value) {
      return value
    }
  }

  return null
}

function readArray(
  record: Record<string, unknown> | null,
  key: string,
): unknown[] | null {
  if (!record) {
    return null
  }

  const value = record[key]

  return Array.isArray(value) ? value : null
}

function readNumber(
  record: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!record) {
    return null
  }

  const value = record[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readRecord(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = record[key]

  return isRecord(value) ? value : null
}

function readString(
  record: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!record) {
    return null
  }

  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function formatCount(count: number, singularLabel: string) {
  return `${count} ${singularLabel}${count > 1 ? 's' : ''}`
}

function formatViewLabel(viewId: string) {
  const labels: Record<string, string> = {
    back: 'Dos',
    custom: 'Zone personnalisée',
    front: 'Devant',
  }

  return labels[viewId] ?? viewId
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values))
}

function isString(value: string | null): value is string {
  return value !== null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

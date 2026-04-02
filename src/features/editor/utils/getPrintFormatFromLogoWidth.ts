import type { PrintFormat } from '../types'

export function getPrintFormatFromLogoWidth(width: number): PrintFormat {
  if (width >= 70) {
    return 'A3'
  }

  if (width >= 50) {
    return 'A4'
  }

  if (width >= 35) {
    return 'A5'
  }

  if (width >= 22) {
    return 'A6'
  }

  return 'A7'
}

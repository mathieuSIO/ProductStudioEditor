import type { PrintFormat } from '../types/PrintFormat'
export type { PrintFormat } from '../types/PrintFormat'

export type QuantityTier = {
  maxQuantity: number | null
  minQuantity: number
  unitPrice: number
}

export type PrintPricingTable = Record<PrintFormat, QuantityTier[]>

export type PricingLogoInput = {
  id: string
  printFormat: PrintFormat
}

export type EditorPricingInput = {
  logos: PricingLogoInput[]
  totalQuantity: number
  textileUnitPrice?: number
}

export type PricingLogoBreakdownLine = {
  logoId: string
  printFormat: PrintFormat
  totalPrintPrice: number
  unitPrintPrice: number
}

export type EditorPricingResult = {
  appliedTier: QuantityTier | null
  grandTotal: number
  logoLines: PricingLogoBreakdownLine[]
  logosCount: number
  printTotal: number
  textileTotal: number
  textileUnitPrice: number
  totalQuantity: number
}

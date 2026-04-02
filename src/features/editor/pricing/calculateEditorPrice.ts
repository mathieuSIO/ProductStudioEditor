import { getQuantityTier } from './getQuantityTier'
import { defaultTextileUnitPrice, printPricingTable } from './printPricingTable'
import type {
  EditorPricingInput,
  EditorPricingResult,
  PricingLogoBreakdownLine,
  PricingLogoInput,
} from './types'

export function calculateEditorPrice(
  input: EditorPricingInput,
): EditorPricingResult {
  const textileUnitPrice = input.textileUnitPrice ?? defaultTextileUnitPrice

  if (input.totalQuantity <= 0) {
    return {
      appliedTier: null,
      grandTotal: 0,
      logoLines: [],
      logosCount: input.logos.length,
      printTotal: 0,
      textileTotal: 0,
      textileUnitPrice,
      totalQuantity: input.totalQuantity,
    }
  }

  const appliedTier = getQuantityTier(input.totalQuantity, printPricingTable.A3)
  const textileTotal = textileUnitPrice * input.totalQuantity
  const logoLines = input.logos.map((logo) =>
    createLogoBreakdownLine(logo, input.totalQuantity),
  )
  const printTotal = logoLines.reduce(
    (total, logoLine) => total + logoLine.totalPrintPrice,
    0,
  )

  return {
    appliedTier,
    grandTotal: textileTotal + printTotal,
    logoLines,
    logosCount: input.logos.length,
    printTotal,
    textileTotal,
    textileUnitPrice,
    totalQuantity: input.totalQuantity,
  }
}

function createLogoBreakdownLine(
  logo: PricingLogoInput,
  totalQuantity: number,
): PricingLogoBreakdownLine {
  const tier = getQuantityTier(totalQuantity, printPricingTable[logo.printFormat])
  const unitPrintPrice = tier.unitPrice

  return {
    logoId: logo.id,
    printFormat: logo.printFormat,
    totalPrintPrice: unitPrintPrice * totalQuantity,
    unitPrintPrice,
  }
}

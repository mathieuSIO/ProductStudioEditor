import tshirtBlackBackMockup from '../../../assets/images/mockup/tshirt-black-back.png'
import tshirtBlackFrontMockup from '../../../assets/images/mockup/tshirt-black-front.png'
import tshirtWhiteBackMockup from '../../../assets/images/mockup/tshirt-white-back.png'
import tshirtWhiteFrontMockup from '../../../assets/images/mockup/tshirt-white-front.png'

import type {
  PrintableArea,
  Product,
  ProductColor,
  ProductMockup,
  ProductView,
  ProductViewId,
} from '../types'

const tshirtPrintableAreas = {
  front: {
    x: 22,
    y: 18,
    width: 56,
    height: 58,
  },
  back: {
    x: 21,
    y: 16,
    width: 58,
    height: 60,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const sweatshirtPrintableAreas = {
  front: {
    x: 22,
    y: 22,
    width: 56,
    height: 52,
  },
  back: {
    x: 21,
    y: 20,
    width: 58,
    height: 54,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const poloPrintableAreas = {
  front: {
    x: 30,
    y: 26,
    width: 40,
    height: 40,
  },
  back: {
    x: 25,
    y: 21,
    width: 50,
    height: 48,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const capPrintableAreas = {
  front: {
    x: 24,
    y: 30,
    width: 52,
    height: 23,
  },
  back: {
    x: 34,
    y: 34,
    width: 32,
    height: 18,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const genericPrintableAreas = {
  front: {
    x: 24,
    y: 20,
    width: 52,
    height: 52,
  },
  back: {
    x: 22,
    y: 18,
    width: 56,
    height: 56,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

export const mockProducts = [
  {
    id: 'tshirt',
    name: 'T-shirt',
    category: 'top',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      createRealColor('white', 'Blanc', '#F5F5F4', 'tshirt', {
        front: createImageView(
          'tshirt',
          tshirtWhiteFrontMockup,
          'T-shirt blanc vue avant',
          tshirtPrintableAreas.front,
        ),
        back: createImageView(
          'tshirt',
          tshirtWhiteBackMockup,
          'T-shirt blanc vue arriere',
          tshirtPrintableAreas.back,
        ),
      }),
      createRealColor('black', 'Noir', '#1C1917', 'tshirt', {
        front: createImageView(
          'tshirt',
          tshirtBlackFrontMockup,
          'T-shirt noir vue avant',
          tshirtPrintableAreas.front,
        ),
        back: createImageView(
          'tshirt',
          tshirtBlackBackMockup,
          'T-shirt noir vue arriere',
          tshirtPrintableAreas.back,
        ),
      }),
      createFallbackColor('navy', 'Marine', '#1E3A5F', 'tshirt', {
        front: tshirtPrintableAreas.front,
        back: tshirtPrintableAreas.back,
      }),
    ],
  },
  {
    id: 'sweatshirt',
    name: 'Pull',
    category: 'top',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      createFallbackColor('white', 'Blanc', '#F5F5F4', 'sweatshirt', sweatshirtPrintableAreas),
      createFallbackColor('black', 'Noir', '#1C1917', 'sweatshirt', sweatshirtPrintableAreas),
      createFallbackColor('navy', 'Marine', '#1E3A5F', 'sweatshirt', sweatshirtPrintableAreas),
    ],
  },
  {
    id: 'polo',
    name: 'Polo',
    category: 'top',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      createFallbackColor('white', 'Blanc', '#F5F5F4', 'polo', poloPrintableAreas),
      createFallbackColor('black', 'Noir', '#1C1917', 'polo', poloPrintableAreas),
      createFallbackColor('navy', 'Marine', '#1E3A5F', 'polo', poloPrintableAreas),
    ],
  },
  {
    id: 'cap',
    name: 'Casquette',
    category: 'headwear',
    sizes: ['TU'],
    colors: [
      createFallbackColor('white', 'Blanc', '#F5F5F4', 'cap', capPrintableAreas),
      createFallbackColor('black', 'Noir', '#1C1917', 'cap', capPrintableAreas),
      createFallbackColor('navy', 'Marine', '#1E3A5F', 'cap', capPrintableAreas),
    ],
  },
  {
    id: 'other',
    name: 'Autre',
    category: 'other',
    sizes: ['TU'],
    colors: [
      createFallbackColor('white', 'Blanc', '#F5F5F4', 'generic', genericPrintableAreas),
      createFallbackColor('black', 'Noir', '#1C1917', 'generic', genericPrintableAreas),
      createFallbackColor('navy', 'Marine', '#1E3A5F', 'generic', genericPrintableAreas),
    ],
  },
] satisfies Product[]

function createImageView(
  mockup: ProductMockup,
  src: string,
  alt: string,
  printableArea: PrintableArea,
): ProductView {
  return {
    asset: {
      kind: 'image',
      src,
      alt,
    },
    mockup,
    printableArea,
  }
}

function createFallbackView(
  mockup: ProductMockup,
  colorLabel: string,
  printableArea: PrintableArea,
): ProductView {
  return {
    asset: {
      kind: 'fallback',
      alt: `${getMockupLabel(mockup)} ${colorLabel}`,
      note: 'Apercu simplifie sans mockup photo reel pour cette couleur.',
    },
    mockup,
    printableArea,
  }
}

function createRealColor(
  id: ProductColor['id'],
  label: string,
  swatchHex: string,
  mockup: ProductMockup,
  views: Partial<Record<ProductViewId, ProductView>>,
): ProductColor {
  return {
    availability: 'real',
    id,
    label,
    swatchHex,
    views: normalizeViews(mockup, label, views),
  }
}

function createFallbackColor(
  id: ProductColor['id'],
  label: string,
  swatchHex: string,
  mockup: ProductMockup,
  areas: Partial<Record<ProductViewId, PrintableArea>>,
): ProductColor {
  const views = Object.fromEntries(
    Object.entries(areas).map(([viewId, printableArea]) => [
      viewId,
      createFallbackView(mockup, label, printableArea),
    ]),
  ) as Partial<Record<ProductViewId, ProductView>>

  return {
    availability: 'fallback',
    id,
    label,
    swatchHex,
    views,
  }
}

function normalizeViews(
  _mockup: ProductMockup,
  _label: string,
  views: Partial<Record<ProductViewId, ProductView>>,
) {
  return views
}

function getMockupLabel(mockup: ProductMockup) {
  switch (mockup) {
    case 'cap':
      return 'Casquette'
    case 'generic':
      return 'Support'
    case 'polo':
      return 'Polo'
    case 'sweatshirt':
      return 'Pull'
    case 'tshirt':
    default:
      return 'T-shirt'
  }
}

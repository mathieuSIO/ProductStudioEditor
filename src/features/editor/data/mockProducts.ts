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
    x: 31,
    y: 24,
    width: 38,
    height: 39,
  },
  back: {
    x: 29,
    y: 22,
    width: 42,
    height: 44,
  },
  left: {
    x: 40,
    y: 24,
    width: 14,
    height: 38,
  },
  right: {
    x: 46,
    y: 24,
    width: 14,
    height: 38,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const sweatshirtPrintableAreas = {
  front: {
    x: 27,
    y: 24,
    width: 46,
    height: 42,
  },
  back: {
    x: 25,
    y: 21,
    width: 50,
    height: 46,
  },
  left: {
    x: 40,
    y: 24,
    width: 15,
    height: 40,
  },
  right: {
    x: 45,
    y: 24,
    width: 15,
    height: 40,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const poloPrintableAreas = {
  front: {
    x: 35,
    y: 26,
    width: 30,
    height: 34,
  },
  back: {
    x: 30,
    y: 22,
    width: 40,
    height: 42,
  },
  left: {
    x: 41,
    y: 27,
    width: 13,
    height: 32,
  },
  right: {
    x: 46,
    y: 27,
    width: 13,
    height: 32,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const capPrintableAreas = {
  front: {
    x: 28,
    y: 31,
    width: 44,
    height: 20,
  },
  back: {
    x: 36,
    y: 35,
    width: 28,
    height: 16,
  },
  left: {
    x: 41,
    y: 31,
    width: 14,
    height: 18,
  },
  right: {
    x: 45,
    y: 31,
    width: 14,
    height: 18,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

const genericPrintableAreas = {
  front: {
    x: 30,
    y: 21,
    width: 40,
    height: 44,
  },
  back: {
    x: 27,
    y: 18,
    width: 46,
    height: 48,
  },
  left: {
    x: 40,
    y: 21,
    width: 14,
    height: 42,
  },
  right: {
    x: 46,
    y: 21,
    width: 14,
    height: 42,
  },
} satisfies Partial<Record<ProductViewId, PrintableArea>>

export const mockProducts = [
  {
    id: 'tshirt',
    name: 'T-shirt',
    category: 'top',
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
        left: createFallbackView('tshirt', 'Blanc', tshirtPrintableAreas.left),
        right: createFallbackView('tshirt', 'Blanc', tshirtPrintableAreas.right),
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
        left: createFallbackView('tshirt', 'Noir', tshirtPrintableAreas.left),
        right: createFallbackView('tshirt', 'Noir', tshirtPrintableAreas.right),
      }),
      createFallbackColor('navy', 'Marine', '#1E3A5F', 'tshirt', {
        front: tshirtPrintableAreas.front,
        back: tshirtPrintableAreas.back,
        left: tshirtPrintableAreas.left,
        right: tshirtPrintableAreas.right,
      }),
    ],
  },
  {
    id: 'sweatshirt',
    name: 'Pull',
    category: 'top',
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

import { describe, expect, it } from 'vitest'

import type { OrderItemDetails } from '../types/account.types'
import {
  getOrderItemCustomizationDetails,
  hasProfessionalLogoReview,
} from './orderCustomizationDetails'

describe('orderCustomizationDetails', () => {
  it('extracts readable customization details from studio order payloads', () => {
    const item: OrderItemDetails = {
      customization: {
        design: {
          views: [
            {
              logos: [
                {
                  name: 'logo-front.png',
                  printFormat: 'A4',
                },
              ],
              viewId: 'front',
            },
          ],
        },
        options: {
          professional_logo_review: true,
        },
        pricing: {
          logosCount: 1,
        },
        product: {
          color: {
            label: 'Blanc',
          },
          quantities: {
            L: 0,
            M: 2,
          },
        },
        texts: ['Equipe MPM'],
      },
      id: 'item-1',
      productName: 'T-shirt',
      quantity: 2,
    }

    const details = getOrderItemCustomizationDetails(item)

    expect(details).toEqual([
      { label: 'Couleur', tone: 'default', value: 'Blanc' },
      { label: 'Taille(s)', tone: 'default', value: 'M : 2' },
      { label: "Zone d'impression", tone: 'default', value: 'Devant (1 logo)' },
      { label: "Format d'impression", tone: 'default', value: 'A4' },
      { label: 'Éléments personnalisés', tone: 'default', value: '1 élément' },
      { label: 'Textes personnalisés', tone: 'default', value: 'Equipe MPM' },
      { label: 'Logo', tone: 'success', value: 'logo-front.png' },
      {
        label: 'Vérification professionnelle du logo',
        tone: 'success',
        value: 'Option choisie',
      },
    ])
  })

  it('detects professional logo review flags from camelCase and snake_case options', () => {
    expect(hasProfessionalLogoReview({ professionalLogoReview: true })).toBe(true)
    expect(hasProfessionalLogoReview({ options: { logo_review: true } })).toBe(true)
    expect(hasProfessionalLogoReview(null)).toBe(false)
  })
})

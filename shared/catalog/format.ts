// Presentation helpers shared by server and client. Locale is fixed to pt-BR so SSR and
// client render identically (no hydration mismatch).

import type { PriceModel, Professional, ProfessionalListItem } from '../types/professional'
import { PRICE_MODEL_LABEL } from './labels'

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function formatBRL(value: number): string {
  return brl.format(value)
}

export function formatPrice(value: number, model: PriceModel): string {
  return `a partir de ${formatBRL(value)}/${PRICE_MODEL_LABEL[model]}`
}

/** Projects a full Professional into the lightweight card DTO. */
export function toListItem(p: Professional, distanceKm?: number): ProfessionalListItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    avatar: p.avatar,
    category: p.category,
    providerType: p.providerType,
    keySpecs: p.keySpecs,
    priceFrom: p.priceFrom,
    priceModel: p.priceModel,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    city: p.location.city,
    state: p.location.state,
    distanceKm,
    verified: p.verified,
    galleryCount: p.gallery.length,
    thumbnail: p.gallery[0]!,
  }
}

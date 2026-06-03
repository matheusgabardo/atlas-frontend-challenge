// Presentation helpers shared by server and client. Locale is fixed to pt-BR so SSR and
// client render identically (no hydration mismatch). See docs/business-rules.md.

import type { PriceModel, Professional, ProfessionalListItem } from '../types/professional'
import { PRICE_MODEL_LABEL, STRUCTURE_LABEL, SYSTEM_LABEL } from './labels'

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

type SpecBag = Record<string, string | number | boolean | string[]>

/** 1–2 short, category-specific specs shown on the card. */
export function formatKeySpecs(p: Professional): string[] {
  const s = p.specs as unknown as SpecBag
  switch (p.category) {
    case 'sonorizacao':
      return [`${SYSTEM_LABEL[s.systemType as string]} · até ${s.audienceMax} pax`, `Console ${s.consoleType}`]
    case 'iluminacao':
      return [`${s.fixtureCount} fixtures`, `Treliça ${String(s.trussType).toUpperCase()}`]
    case 'led':
      return [`LED P${s.pixelPitch} · ${s.areaM2} m²`, `${s.environment}`]
    case 'projecao':
      return [`${s.projectorLumens} lúmens`, s.mappingCapable ? 'Mapping' : `${s.screenSizeM} m`]
    case 'palco':
      return [
        `${STRUCTURE_LABEL[s.structureType as string]} · ${s.stageAreaM2} m²`,
        s.roofIncluded ? 'Com cobertura' : 'Sem cobertura',
      ]
    case 'gerador':
      return [`${s.powerKva} kVA`, s.silenced ? 'Silenciado' : String(s.phases)]
    default:
      return []
  }
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
    headline: p.headline,
    priceFrom: p.priceFrom,
    priceModel: p.priceModel,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    city: p.location.city,
    state: p.location.state,
    distanceKm,
    verified: p.verified,
    keySpecs: formatKeySpecs(p).slice(0, 2),
    thumbnail: p.gallery[0]!,
  }
}

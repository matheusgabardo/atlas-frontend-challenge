// Category metadata and contextual-facet configuration (single source of truth for the
// faceted search). Drives the filter UI and the query engine.
// See docs/business-rules.md §1, §2.

import type { Category, CategoryGroup, CategorySlug } from '../types/category'

export const CATEGORY_GROUP_LABELS: Record<CategoryGroup, string> = {
  'som-luz': 'Som & Luz',
  imagem: 'Imagem',
  'estrutura-energia': 'Estrutura & Energia',
}

export const CATEGORIES: Category[] = [
  { slug: 'sonorizacao', label: 'Sonorização', group: 'som-luz', icon: 'speaker' },
  { slug: 'iluminacao', label: 'Iluminação / VJ', group: 'som-luz', icon: 'lightbulb' },
  { slug: 'led', label: 'Painel de LED', group: 'imagem', icon: 'monitor' },
  { slug: 'projecao', label: 'Projeção & Mapping', group: 'imagem', icon: 'projector' },
  { slug: 'palco', label: 'Palco / Treliça', group: 'estrutura-energia', icon: 'layers' },
  { slug: 'gerador', label: 'Gerador / Energia', group: 'estrutura-energia', icon: 'plug' },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>

/** A spec field exposed as a contextual filter when its category is selected. */
export interface SpecFacetDef {
  field: string
  label: string
  type: 'enum' | 'range' | 'boolean'
  unit?: string
}

export const CONTEXTUAL_FACETS: Record<CategorySlug, SpecFacetDef[]> = {
  sonorizacao: [
    { field: 'systemType', label: 'Tipo de sistema', type: 'enum' },
    { field: 'consoleType', label: 'Console', type: 'enum' },
  ],
  iluminacao: [
    { field: 'fixtureTypes', label: 'Tipo de fixture', type: 'enum' },
    { field: 'trussType', label: 'Treliça', type: 'enum' },
  ],
  led: [
    { field: 'environment', label: 'Ambiente', type: 'enum' },
    { field: 'pixelPitch', label: 'Pixel pitch', type: 'range', unit: 'mm' },
    { field: 'format', label: 'Formato', type: 'enum' },
  ],
  projecao: [
    { field: 'mappingCapable', label: 'Mapping', type: 'boolean' },
    { field: 'screenType', label: 'Tela', type: 'enum' },
    { field: 'projectorLumens', label: 'Lúmens (ANSI)', type: 'range', unit: 'lm' },
  ],
  palco: [
    { field: 'structureType', label: 'Estrutura', type: 'enum' },
    { field: 'roofIncluded', label: 'Cobertura', type: 'boolean' },
  ],
  gerador: [
    { field: 'powerKva', label: 'Potência', type: 'range', unit: 'kVA' },
    { field: 'silenced', label: 'Silenciado', type: 'boolean' },
    { field: 'phases', label: 'Fases', type: 'enum' },
  ],
}

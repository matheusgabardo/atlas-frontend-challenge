// Catalog query contract — shared by the Nitro API, the pure query engine and the client.
// `route.query` is the source of truth (docs/adr/0007); this is its typed shape.

import type { CategorySlug } from './category'
import type { ProfessionalListItem } from './professional'

export const SORT_OPTIONS = [
  'relevancia',
  'preco-asc',
  'preco-desc',
  'avaliacao',
  'avaliados',
  'distancia',
] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export interface CatalogQuery {
  /** Free-text over name, category label, key specs and spec values. */
  q?: string
  categories?: CategorySlug[]
  priceMin?: number
  priceMax?: number
  ratingMin?: number
  /** Two-letter state code (UF). */
  state?: string
  /** City name. */
  city?: string
  /** Available on weekends. */
  weekend?: boolean
  /** Brings own equipment/structure. */
  operator?: boolean
  verified?: boolean
  /** ISO date of the event; excludes providers already booked on that date. */
  eventDate?: string
  /** Contextual spec filters keyed by facet id. Enum values may be multi-select (OR). */
  specs?: Record<string, string | string[] | boolean>
  sort?: SortOption
  page?: number
  pageSize?: number
}

export interface FacetCount {
  value: string
  label?: string
  count: number
}

export interface CatalogFacets {
  categories: FacetCount[]
  priceRange: { min: number; max: number }
  /** Contextual facets keyed by facet id; present for the selected categories. */
  specs?: Record<string, FacetCount[]>
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export type CatalogResponse = Paginated<ProfessionalListItem> & { facets: CatalogFacets }

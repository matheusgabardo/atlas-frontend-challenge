// Catalog query contract — shared by the Nitro API, the pure query engine and the client.
// `route.query` is the source of truth (see docs/adr/0007); this is its typed shape.

import type { CategorySlug } from './category'
import type { CapacityTier } from './specs'
import type { ProfessionalListItem } from './professional'

export const SORT_OPTIONS = [
  'relevance',
  'price-asc',
  'price-desc',
  'rating-desc',
  'distance-asc',
  'reviews-desc',
] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export interface CatalogQuery {
  /** Free-text search over name, category label, headline and spec terms. */
  q?: string
  categories?: CategorySlug[]
  priceMin?: number
  priceMax?: number
  ratingMin?: number
  /** Two-letter state code (UF). */
  state?: string
  /** IBGE municipality code of the selected city. */
  city?: string
  availableThisWeekend?: boolean
  /** ISO date of the event; excludes suppliers already booked on that date. */
  eventDate?: string
  verified?: boolean
  capacityTier?: CapacityTier
  brands?: string[]
  operatorIncluded?: boolean
  /** Contextual spec filters, keyed by spec field name (active per selected category). */
  specs?: Record<string, string | number | boolean>
  sort?: SortOption
  page?: number
  pageSize?: number
  /** Reference city (IBGE code) used to compute/sort by distance. */
  refIbgeCode?: string
}

export interface FacetCount {
  value: string
  label?: string
  count: number
}

export interface CatalogFacets {
  categories: FacetCount[]
  priceRange: { min: number; max: number }
  /** Contextual facets keyed by spec field; present when a single category is selected. */
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

// Pure catalog engine: filter + facet counts + sort + pagination over an in-memory list.
// Isolated from Nitro so it is trivially unit-testable (highest-ROI tests). See docs/adr/0004.
//
// Faceted-search rule: a facet's counts are computed over the set filtered by every OTHER
// active filter (not by the facet's own selection), so options never collapse to zero just
// because they are selected.

import type { Professional } from '../types/professional'
import type { CatalogQuery, CatalogFacets, FacetCount, SortOption } from '../types/query'
import { CATEGORIES, CONTEXTUAL_FACETS } from './categories'
import { normalizeText } from './text'

const DEFAULT_PAGE_SIZE = 24

export interface ApplyQueryOptions {
  /** Distance in km from the reference location, or undefined when unknown. */
  distanceFor?: (p: Professional) => number | undefined
}

export interface QueryResult {
  items: Professional[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
  facets: CatalogFacets
}

function buildSearchText(p: Professional): string {
  const categoryLabel = CATEGORIES.find((c) => c.slug === p.category)?.label ?? ''
  const specs = p.specs as Record<string, unknown>
  const specValues = Object.values(specs).flatMap((v) =>
    Array.isArray(v) ? v.map(String) : [String(v)],
  )
  return normalizeText(
    [p.name, categoryLabel, p.headline, ...p.services.map((s) => s.name), ...specValues].join(' '),
  )
}

function matchesSpecs(p: Professional, specs?: CatalogQuery['specs']): boolean {
  if (!specs) return true
  const fields = p.specs as Record<string, unknown>
  for (const [key, expected] of Object.entries(specs)) {
    const actual = fields[key]
    if (Array.isArray(actual)) {
      if (!actual.map(String).includes(String(expected))) return false
    } else if (typeof actual === 'number') {
      // Range facet: the query value acts as a minimum threshold.
      if (typeof expected === 'number') {
        if (actual < expected) return false
      } else if (String(actual) !== String(expected)) {
        return false
      }
    } else if (typeof actual === 'boolean') {
      if (actual !== (expected === true || expected === 'true')) return false
    } else if (String(actual) !== String(expected)) {
      return false
    }
  }
  return true
}

function buildCategoryFacets(items: Professional[]): FacetCount[] {
  const counts = new Map<string, number>()
  for (const p of items) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  return CATEGORIES.map((c) => ({ value: c.slug, label: c.label, count: counts.get(c.slug) ?? 0 }))
}

function priceBounds(items: Professional[]): { min: number; max: number } {
  if (!items.length) return { min: 0, max: 0 }
  let min = Infinity
  let max = -Infinity
  for (const p of items) {
    if (p.priceFrom < min) min = p.priceFrom
    if (p.priceFrom > max) max = p.priceFrom
  }
  return { min, max }
}

function buildSpecFacets(items: Professional[], category: string): Record<string, FacetCount[]> {
  const defs = CONTEXTUAL_FACETS[category as keyof typeof CONTEXTUAL_FACETS] ?? []
  const out: Record<string, FacetCount[]> = {}
  for (const def of defs) {
    if (def.type === 'range') continue // ranges use slider bounds, not value counts (v1)
    const counts = new Map<string, number>()
    for (const p of items) {
      const value = (p.specs as Record<string, unknown>)[def.field]
      if (value == null) continue
      const values = Array.isArray(value) ? value.map(String) : [String(value)]
      for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
    }
    out[def.field] = [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
  }
  return out
}

function sortItems(
  items: Professional[],
  sort: SortOption,
  distanceFor?: ApplyQueryOptions['distanceFor'],
): Professional[] {
  const byId = (a: Professional, b: Professional) => a.id.localeCompare(b.id)
  const comparators: Record<SortOption, (a: Professional, b: Professional) => number> = {
    'price-asc': (a, b) => a.priceFrom - b.priceFrom || byId(a, b),
    'price-desc': (a, b) => b.priceFrom - a.priceFrom || byId(a, b),
    'rating-desc': (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || byId(a, b),
    'reviews-desc': (a, b) => b.reviewsCount - a.reviewsCount || byId(a, b),
    'distance-asc': (a, b) =>
      (distanceFor?.(a) ?? Infinity) - (distanceFor?.(b) ?? Infinity) || byId(a, b),
    relevance: (a, b) =>
      Number(b.verified) - Number(a.verified) ||
      (b.rating ?? -1) - (a.rating ?? -1) ||
      b.reviewsCount - a.reviewsCount ||
      byId(a, b),
  }
  return [...items].sort(comparators[sort] ?? comparators.relevance)
}

export function applyQuery(
  all: Professional[],
  query: CatalogQuery,
  options: ApplyQueryOptions = {},
): QueryResult {
  const inCategory = (p: Professional) =>
    !query.categories?.length || query.categories.includes(p.category)
  const inPrice = (p: Professional) =>
    (query.priceMin == null || p.priceFrom >= query.priceMin) &&
    (query.priceMax == null || p.priceFrom <= query.priceMax)
  const inSpecs = (p: Professional) => matchesSpecs(p, query.specs)

  // Base = all filters EXCEPT category, specs and price (those drive their own facets).
  const normalizedQ = query.q ? normalizeText(query.q) : ''
  const base = all.filter((p) => {
    if (normalizedQ && !buildSearchText(p).includes(normalizedQ)) return false
    if (query.ratingMin != null && (p.rating == null || p.rating < query.ratingMin)) return false
    if (query.state && p.location.state !== query.state) return false
    if (query.city && p.location.ibgeCode !== query.city) return false
    if (query.availableThisWeekend && !p.availability.availableThisWeekend) return false
    if (query.eventDate && p.availability.bookedDates.includes(query.eventDate)) return false
    if (query.verified && !p.verified) return false
    if (query.capacityTier && p.specs.capacityTier !== query.capacityTier) return false
    if (query.operatorIncluded && !p.specs.operatorIncluded) return false
    if (query.brands?.length) {
      const brands = p.specs.brands ?? []
      if (!query.brands.some((b) => brands.includes(b))) return false
    }
    return true
  })

  // Category facets: base + price (independent of the category selection).
  const categories = buildCategoryFacets(base.filter(inPrice))

  // Price range: base + category + specs (independent of the price selection).
  const priceRange = priceBounds(base.filter(inCategory).filter(inSpecs))

  // Contextual spec facets: only meaningful when exactly one category is selected.
  let specs: Record<string, FacetCount[]> | undefined
  if (query.categories?.length === 1) {
    const category = query.categories[0]!
    specs = buildSpecFacets(
      base.filter((p) => p.category === category).filter(inPrice),
      category,
    )
  }

  const filtered = base.filter(inCategory).filter(inSpecs).filter(inPrice)
  const sorted = sortItems(filtered, query.sort ?? 'relevance', options.distanceFor)

  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE)
  const page = Math.max(1, query.page ?? 1)
  const total = sorted.length
  const start = (page - 1) * pageSize
  const items = sorted.slice(start, start + pageSize)

  return {
    items,
    page,
    pageSize,
    total,
    hasMore: start + items.length < total,
    facets: { categories, priceRange, specs },
  }
}

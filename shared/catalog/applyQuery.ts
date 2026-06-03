// Pure catalog engine: filter + facet counts + sort + pagination over an in-memory list.
// Isolated from Nitro so it is trivially unit-testable (highest-ROI tests). See docs/adr/0004.
//
// Faceted-search rule: a facet's counts are computed over the set filtered by every OTHER
// active filter (not by the facet's own selection), so options never collapse to zero just
// because they are selected.

import type { Professional } from '../types/professional'
import type { CatalogFacets, CatalogQuery, FacetCount, SortOption } from '../types/query'
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
  const label = CATEGORIES.find((c) => c.slug === p.category)?.label ?? ''
  const specValues = Object.values(p.specs).map(String)
  return normalizeText([p.name, label, ...p.keySpecs, ...specValues].join(' '))
}

function matchesSpecs(p: Professional, specs?: CatalogQuery['specs']): boolean {
  if (!specs) return true
  for (const [facetId, expected] of Object.entries(specs)) {
    const actual = p.specs[facetId]
    if (typeof expected === 'boolean') {
      if (expected && actual !== true) return false
    } else if (Array.isArray(expected)) {
      if (expected.length && !expected.includes(String(actual))) return false
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

function buildSpecFacets(
  items: Professional[],
  categories: readonly string[],
): Record<string, FacetCount[]> {
  const out: Record<string, FacetCount[]> = {}
  for (const cat of categories) {
    for (const facet of CONTEXTUAL_FACETS[cat as keyof typeof CONTEXTUAL_FACETS] ?? []) {
      if (facet.type === 'bool') {
        const count = items.filter((p) => p.specs[facet.id] === true).length
        out[facet.id] = [{ value: 'true', label: facet.options[0], count }]
      } else {
        const counts = new Map<string, number>()
        for (const p of items) {
          const value = p.specs[facet.id]
          if (value == null || value === false) continue
          counts.set(String(value), (counts.get(String(value)) ?? 0) + 1)
        }
        out[facet.id] = facet.options.map((opt) => ({ value: opt, count: counts.get(opt) ?? 0 }))
      }
    }
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
    'preco-asc': (a, b) => a.priceFrom - b.priceFrom || byId(a, b),
    'preco-desc': (a, b) => b.priceFrom - a.priceFrom || byId(a, b),
    avaliacao: (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || byId(a, b),
    avaliados: (a, b) => b.reviewsCount - a.reviewsCount || byId(a, b),
    distancia: (a, b) =>
      (distanceFor?.(a) ?? Infinity) - (distanceFor?.(b) ?? Infinity) || byId(a, b),
    relevancia: (a, b) =>
      Number(b.verified) - Number(a.verified) ||
      (b.rating ?? -1) - (a.rating ?? -1) ||
      b.reviewsCount - a.reviewsCount ||
      byId(a, b),
  }
  return [...items].sort(comparators[sort] ?? comparators.relevancia)
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
    if (query.city && p.location.city !== query.city) return false
    if (query.weekend && !p.weekend) return false
    if (query.operator && !p.operator) return false
    if (query.verified && !p.verified) return false
    if (query.eventDate && p.availability.bookedDates.includes(query.eventDate)) return false
    return true
  })

  const categories = buildCategoryFacets(base.filter(inPrice))
  const priceRange = priceBounds(base.filter(inCategory).filter(inSpecs))

  let specs: Record<string, FacetCount[]> | undefined
  if (query.categories?.length) {
    const inSelected = base.filter((p) => query.categories!.includes(p.category)).filter(inPrice)
    specs = buildSpecFacets(inSelected, query.categories)
  }

  const filtered = base.filter(inCategory).filter(inSpecs).filter(inPrice)
  const sorted = sortItems(filtered, query.sort ?? 'relevancia', options.distanceFor)

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

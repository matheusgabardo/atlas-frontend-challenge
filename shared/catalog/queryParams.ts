// Bidirectional mapping between URL params and the typed CatalogQuery.
// `route.query` is the source of truth (docs/adr/0007); keeping parse/serialize pure and
// symmetric lets us round-trip-test the URL state.

import { CATEGORY_SLUGS, type CategorySlug } from '../types/category'
import type { CapacityTier } from '../types/specs'
import { SORT_OPTIONS, type CatalogQuery, type SortOption } from '../types/query'

type ParamValue = string | string[] | null | undefined
type Params = Record<string, ParamValue>

const TIERS: readonly string[] = ['pequeno', 'medio', 'grande', 'open-air']

function first(v: ParamValue): string | undefined {
  const s = Array.isArray(v) ? v[0] : v
  return s == null || s === '' ? undefined : s
}
function num(v: ParamValue): number | undefined {
  const s = first(v)
  if (s == null) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}
function bool(v: ParamValue): boolean | undefined {
  const s = first(v)
  if (s == null) return undefined
  return s === 'true' || s === '1'
}
function list(v: ParamValue): string[] | undefined {
  if (v == null) return undefined
  const arr = (Array.isArray(v) ? v : String(v).split(',')).map((s) => s.trim()).filter(Boolean)
  return arr.length ? arr : undefined
}
function coerce(s: string): string | number | boolean {
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s)
  if (s === 'true') return true
  if (s === 'false') return false
  return s
}

export function parseCatalogQuery(params: Params): CatalogQuery {
  const categories = list(params.categories)?.filter((c): c is CategorySlug =>
    (CATEGORY_SLUGS as readonly string[]).includes(c),
  )
  const sortRaw = first(params.sort)
  const sort = SORT_OPTIONS.includes(sortRaw as SortOption) ? (sortRaw as SortOption) : undefined
  const tierRaw = first(params.capacityTier)
  const capacityTier = TIERS.includes(tierRaw ?? '') ? (tierRaw as CapacityTier) : undefined

  const specs: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith('spec.')) continue
    const s = first(value)
    if (s != null) specs[key.slice(5)] = coerce(s)
  }

  return {
    q: first(params.q),
    categories,
    priceMin: num(params.priceMin),
    priceMax: num(params.priceMax),
    ratingMin: num(params.ratingMin),
    state: first(params.state),
    city: first(params.city),
    availableThisWeekend: bool(params.availableThisWeekend) || undefined,
    eventDate: first(params.eventDate),
    verified: bool(params.verified) || undefined,
    capacityTier,
    operatorIncluded: bool(params.operatorIncluded) || undefined,
    brands: list(params.brands),
    sort,
    page: num(params.page),
    pageSize: num(params.pageSize),
    refIbgeCode: first(params.refIbgeCode),
    specs: Object.keys(specs).length ? specs : undefined,
  }
}

export function serializeCatalogQuery(query: CatalogQuery): Record<string, string> {
  const out: Record<string, string> = {}
  const set = (key: string, value: string | number | boolean | undefined) => {
    if (value !== undefined && value !== '') out[key] = String(value)
  }
  set('q', query.q)
  if (query.categories?.length) out.categories = query.categories.join(',')
  set('priceMin', query.priceMin)
  set('priceMax', query.priceMax)
  set('ratingMin', query.ratingMin)
  set('state', query.state)
  set('city', query.city)
  if (query.availableThisWeekend) out.availableThisWeekend = 'true'
  set('eventDate', query.eventDate)
  if (query.verified) out.verified = 'true'
  set('capacityTier', query.capacityTier)
  if (query.operatorIncluded) out.operatorIncluded = 'true'
  if (query.brands?.length) out.brands = query.brands.join(',')
  set('sort', query.sort)
  set('page', query.page)
  set('pageSize', query.pageSize)
  set('refIbgeCode', query.refIbgeCode)
  if (query.specs) for (const [k, v] of Object.entries(query.specs)) set(`spec.${k}`, v)
  return out
}

// Bidirectional mapping between URL params and the typed CatalogQuery.
// `route.query` is the source of truth (docs/adr/0007); keeping parse/serialize pure and
// symmetric lets us round-trip-test the URL state.

import { CATEGORY_SLUGS, type CategorySlug } from '../types/category'
import { SORT_OPTIONS, type CatalogQuery, type SortOption } from '../types/query'

// Aceita o shape do `route.query` do vue-router (valores podem ser null e arrays podem conter null).
type ParamValue = string | (string | null)[] | null | undefined
type Params = Record<string, ParamValue>

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
  const arr = (Array.isArray(v) ? v : String(v).split(',')).map((s) => (s ?? '').trim()).filter(Boolean)
  return arr.length ? arr : undefined
}

export function parseCatalogQuery(params: Params): CatalogQuery {
  const categories = list(params.categories)?.filter((c): c is CategorySlug =>
    (CATEGORY_SLUGS as readonly string[]).includes(c),
  )
  const sortRaw = first(params.sort)
  const sort = SORT_OPTIONS.includes(sortRaw as SortOption) ? (sortRaw as SortOption) : undefined

  const specs: Record<string, string | string[] | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith('spec.')) continue
    const values = list(value)
    if (!values) continue
    if (values.length > 1) specs[key.slice(5)] = values
    else {
      const s = values[0]!
      specs[key.slice(5)] = s === 'true' ? true : s === 'false' ? false : s
    }
  }

  return {
    q: first(params.q),
    categories,
    priceMin: num(params.priceMin),
    priceMax: num(params.priceMax),
    ratingMin: num(params.ratingMin),
    state: first(params.state),
    city: first(params.city),
    weekend: bool(params.weekend) || undefined,
    operator: bool(params.operator) || undefined,
    verified: bool(params.verified) || undefined,
    eventDate: first(params.eventDate),
    sort,
    page: num(params.page),
    pageSize: num(params.pageSize),
    specs: Object.keys(specs).length ? specs : undefined,
  }
}

export function serializeCatalogQuery(query: CatalogQuery): Record<string, string> {
  const out: Record<string, string> = {}
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== '') out[key] = String(value)
  }
  set('q', query.q)
  if (query.categories?.length) out.categories = query.categories.join(',')
  set('priceMin', query.priceMin)
  set('priceMax', query.priceMax)
  set('ratingMin', query.ratingMin)
  set('state', query.state)
  set('city', query.city)
  if (query.weekend) out.weekend = 'true'
  if (query.operator) out.operator = 'true'
  if (query.verified) out.verified = 'true'
  set('eventDate', query.eventDate)
  set('sort', query.sort)
  set('page', query.page)
  set('pageSize', query.pageSize)
  if (query.specs) {
    for (const [k, v] of Object.entries(query.specs)) {
      if (Array.isArray(v)) {
        if (v.length) out[`spec.${k}`] = v.join(',')
      } else if (typeof v === 'boolean') {
        if (v) out[`spec.${k}`] = 'true'
      } else {
        set(`spec.${k}`, v)
      }
    }
  }
  return out
}

// GET /api/professionals — paginated, filtered, sorted catalog with facet counts.
// Filtering/sorting/pagination live in the pure applyQuery engine (docs/adr/0004).

import { applyQuery } from '../../../shared/catalog/applyQuery'
import { haversineKm } from '../../../shared/catalog/distance'
import { toListItem } from '../../../shared/catalog/format'
import { parseCatalogQuery } from '../../../shared/catalog/queryParams'
import { CITY_BY_KEY } from '../../../shared/data/cities'
import type { Professional } from '../../../shared/types/professional'
import type { CatalogResponse } from '../../../shared/types/query'

export default defineEventHandler((event): CatalogResponse => {
  const query = parseCatalogQuery(getQuery(event) as Record<string, string | string[]>)

  // Distance is measured from the selected city (when one is chosen).
  const origin = query.city && query.state ? CITY_BY_KEY[`${query.state}:${query.city}`] : undefined
  const distanceFor = origin
    ? (p: Professional): number | undefined => haversineKm(origin, p.location)
    : undefined

  const result = applyQuery(getAllProfessionals(), query, { distanceFor })

  return {
    items: result.items.map((p) => toListItem(p, distanceFor?.(p))),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    hasMore: result.hasMore,
    facets: result.facets,
  }
})

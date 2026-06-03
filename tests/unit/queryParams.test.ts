import { describe, expect, it } from 'vitest'
import { parseCatalogQuery, serializeCatalogQuery } from '../../shared/catalog/queryParams'
import type { CatalogQuery } from '../../shared/types'

describe('queryParams', () => {
  it('round-trips a representative query (serialize → parse)', () => {
    const query: CatalogQuery = {
      q: 'line array',
      categories: ['sonorizacao', 'led'],
      priceMin: 500,
      priceMax: 5000,
      ratingMin: 4.5,
      state: 'SP',
      city: '3550308',
      availableThisWeekend: true,
      eventDate: '2026-07-04',
      verified: true,
      capacityTier: 'grande',
      operatorIncluded: true,
      brands: ['d&b', 'JBL'],
      sort: 'price-asc',
      page: 2,
      pageSize: 24,
      refIbgeCode: '3550308',
      specs: { systemType: 'line-array', powerWRms: 10000, silenced: true },
    }
    expect(parseCatalogQuery(serializeCatalogQuery(query))).toEqual(query)
  })

  it('parses comma-separated arrays and typed spec.* params', () => {
    const q = parseCatalogQuery({
      categories: 'led,gerador',
      'spec.pixelPitch': '2.6',
      'spec.silenced': 'true',
    })
    expect(q.categories).toEqual(['led', 'gerador'])
    expect(q.specs).toEqual({ pixelPitch: 2.6, silenced: true })
  })

  it('drops invalid category and sort values', () => {
    const q = parseCatalogQuery({ categories: 'led,banana', sort: 'whatever' })
    expect(q.categories).toEqual(['led'])
    expect(q.sort).toBeUndefined()
  })

  it('ignores empty/null/undefined params', () => {
    const q = parseCatalogQuery({ q: '', page: undefined, city: null })
    expect(q.q).toBeUndefined()
    expect(q.page).toBeUndefined()
    expect(q.city).toBeUndefined()
  })
})

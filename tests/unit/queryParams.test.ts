import { describe, expect, it } from 'vitest'
import { parseCatalogQuery, serializeCatalogQuery } from '../../shared/catalog/queryParams'
import type { CatalogQuery } from '../../shared/types'

describe('queryParams', () => {
  it('round-trips a representative query (serialize → parse)', () => {
    const query: CatalogQuery = {
      q: 'dj open',
      categories: ['dj', 'som'],
      priceMin: 500,
      priceMax: 5000,
      ratingMin: 4.5,
      state: 'SP',
      city: 'São Paulo',
      weekend: true,
      operator: true,
      verified: true,
      eventDate: '2026-07-04',
      sort: 'preco-asc',
      page: 2,
      pageSize: 24,
      specs: { estilo: ['House', 'Eletrônica'], estrutura: true, console: 'Digital' },
    }
    expect(parseCatalogQuery(serializeCatalogQuery(query))).toEqual(query)
  })

  it('parses comma arrays and typed spec.* params', () => {
    const q = parseCatalogQuery({
      categories: 'dj,som',
      'spec.estilo': 'House,Eletrônica',
      'spec.estrutura': 'true',
    })
    expect(q.categories).toEqual(['dj', 'som'])
    expect(q.specs).toEqual({ estilo: ['House', 'Eletrônica'], estrutura: true })
  })

  it('drops invalid category and sort values', () => {
    const q = parseCatalogQuery({ categories: 'dj,banana', sort: 'whatever' })
    expect(q.categories).toEqual(['dj'])
    expect(q.sort).toBeUndefined()
  })

  it('ignores empty/null/undefined params', () => {
    const q = parseCatalogQuery({ q: '', page: undefined, city: null })
    expect(q.q).toBeUndefined()
    expect(q.page).toBeUndefined()
    expect(q.city).toBeUndefined()
  })

  // Guards the keepalive fetch key (docs/adr/0010): the catalog watches a STRING key
  // derived from serializeCatalogQuery, so navigating back to an identical URL must
  // produce an identical string and NOT re-trigger the fetch (which would reset the
  // accumulated "load more" pages). Different content must yield a different key.
  it('serializes equal queries to an identical, stable string key', () => {
    const a: CatalogQuery = { categories: ['dj', 'som'], city: 'São Paulo', sort: 'preco-asc' }
    const b: CatalogQuery = { categories: ['dj', 'som'], city: 'São Paulo', sort: 'preco-asc' }
    expect(JSON.stringify(serializeCatalogQuery(a))).toBe(JSON.stringify(serializeCatalogQuery(b)))

    const c: CatalogQuery = { categories: ['dj'], city: 'São Paulo', sort: 'preco-asc' }
    expect(JSON.stringify(serializeCatalogQuery(a))).not.toBe(JSON.stringify(serializeCatalogQuery(c)))
  })
})

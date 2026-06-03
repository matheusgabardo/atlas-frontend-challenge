import { describe, expect, it } from 'vitest'
import { applyQuery } from '../../shared/catalog/applyQuery'
import type { Professional } from '../../shared/types'

let seq = 0
function pro(over: Partial<Professional> = {}): Professional {
  seq += 1
  return {
    id: `p${seq}`,
    slug: `pro-${seq}`,
    name: `Fornecedor ${seq}`,
    avatar: '',
    category: 'dj',
    providerType: 'pessoa',
    keySpecs: ['House'],
    specs: { estilo: 'House', estrutura: true, experiencia: '5 anos' },
    headline: '',
    bio: '',
    description: '',
    location: { state: 'SP', city: 'São Paulo', lat: -23.55, lng: -46.63 },
    priceFrom: 1500,
    priceModel: 'evento',
    rating: 4.6,
    reviewsCount: 20,
    reviews: [],
    services: [],
    gallery: [{ url: '', width: 9, height: 6, alt: '' }],
    availability: { weekdays: [5, 6], nextAvailableDate: '2026-07-01', bookedDates: [] },
    verified: true,
    weekend: true,
    operator: true,
    yearsExperience: 5,
    completedJobs: 50,
    responseTime: '~1h',
    ...over,
  }
}

const som = (over: Partial<Professional> = {}) =>
  pro({ category: 'som', specs: { arranjo: 'Line array', console: 'Digital', experiencia: '8 anos' }, ...over })

describe('applyQuery — filters', () => {
  it('filters by category', () => {
    const res = applyQuery([pro(), som(), pro()], { categories: ['som'] })
    expect(res.total).toBe(1)
    expect(res.items[0]!.category).toBe('som')
  })

  it('price range is inclusive on both bounds', () => {
    const data = [pro({ priceFrom: 500 }), pro({ priceFrom: 1000 }), pro({ priceFrom: 2000 })]
    const res = applyQuery(data, { priceMin: 500, priceMax: 1000 })
    expect(res.items.map((p) => p.priceFrom).sort((a, b) => a - b)).toEqual([500, 1000])
  })

  it('ratingMin excludes providers without rating', () => {
    const res = applyQuery([pro({ rating: 4.8 }), pro({ rating: null }), pro({ rating: 3 })], {
      ratingMin: 4,
    })
    expect(res.total).toBe(1)
    expect(res.items[0]!.rating).toBe(4.8)
  })

  it('search is accent- and case-insensitive', () => {
    const data = [pro({ name: 'DJ José Andrade' }), som({ name: 'Sonorização Premium' })]
    expect(applyQuery(data, { q: 'jose' }).total).toBe(1)
    expect(applyQuery(data, { q: 'JOSÉ' }).total).toBe(1)
  })

  it('filters by enum spec (estilo)', () => {
    const open = pro({ specs: { estilo: 'Open format', estrutura: false, experiencia: '3 anos' } })
    const res = applyQuery([pro(), open], { categories: ['dj'], specs: { estilo: 'Open format' } })
    expect(res.total).toBe(1)
  })

  it('filters by boolean spec (estrutura)', () => {
    const no = pro({ specs: { estilo: 'House', estrutura: false, experiencia: '2 anos' } })
    const res = applyQuery([pro(), no], { categories: ['dj'], specs: { estrutura: true } })
    expect(res.total).toBe(1)
    expect(res.items[0]!.specs.estrutura).toBe(true)
  })

  it('multi-select enum spec matches any of the values (OR)', () => {
    const data = [
      pro({ specs: { estilo: 'House', estrutura: true, experiencia: '5 anos' } }),
      pro({ specs: { estilo: 'Eletrônica', estrutura: true, experiencia: '5 anos' } }),
      pro({ specs: { estilo: 'Sertanejo', estrutura: true, experiencia: '5 anos' } }),
    ]
    const res = applyQuery(data, { categories: ['dj'], specs: { estilo: ['House', 'Eletrônica'] } })
    expect(res.total).toBe(2)
  })

  it('filters by event date (excludes booked providers)', () => {
    const free = pro()
    const booked = pro({
      availability: { weekdays: [5, 6], nextAvailableDate: '2026-07-01', bookedDates: ['2026-07-04'] },
    })
    const res = applyQuery([free, booked], { eventDate: '2026-07-04' })
    expect(res.total).toBe(1)
    expect(res.items[0]!.id).toBe(free.id)
  })
})

describe('applyQuery — sorting', () => {
  it('sorts by price ascending', () => {
    const data = [pro({ priceFrom: 3000 }), pro({ priceFrom: 1000 }), pro({ priceFrom: 2000 })]
    expect(applyQuery(data, { sort: 'preco-asc' }).items.map((p) => p.priceFrom)).toEqual([
      1000, 2000, 3000,
    ])
  })

  it('sorts by distance using distanceFor', () => {
    const a = pro({ id: 'a' })
    const b = pro({ id: 'b' })
    const c = pro({ id: 'c' })
    const dist: Record<string, number> = { a: 30, b: 5, c: 12 }
    const res = applyQuery([a, b, c], { sort: 'distancia' }, { distanceFor: (p) => dist[p.id] })
    expect(res.items.map((p) => p.id)).toEqual(['b', 'c', 'a'])
  })
})

describe('applyQuery — pagination', () => {
  it('paginates without overlap and reports hasMore/total', () => {
    const data = Array.from({ length: 30 }, () => pro())
    const p1 = applyQuery(data, { page: 1, pageSize: 24 })
    const p2 = applyQuery(data, { page: 2, pageSize: 24 })
    expect(p1.items).toHaveLength(24)
    expect(p1.hasMore).toBe(true)
    expect(p1.total).toBe(30)
    expect(p2.items).toHaveLength(6)
    expect(p2.hasMore).toBe(false)
    expect(new Set([...p1.items, ...p2.items].map((p) => p.id)).size).toBe(30)
  })
})

describe('applyQuery — facets', () => {
  it('category facet counts are independent of the selected category', () => {
    const res = applyQuery([pro(), pro(), som()], { categories: ['luz'] })
    const byCat = Object.fromEntries(res.facets.categories.map((f) => [f.value, f.count]))
    expect(byCat.dj).toBe(2)
    expect(byCat.som).toBe(1)
    expect(res.facets.categories).toHaveLength(9)
  })

  it('exposes contextual spec facets for the selected category', () => {
    const res = applyQuery([pro(), pro()], { categories: ['dj'] })
    expect(res.facets.specs).toBeDefined()
    expect(res.facets.specs!.estilo).toBeDefined()
    expect(res.facets.specs!.estrutura).toBeDefined()
  })
})

import { describe, expect, it } from 'vitest'
import { applyQuery } from '../../shared/catalog/applyQuery'
import type { CategorySlug, Professional, TechSpecs } from '../../shared/types'

let seq = 0
function pro(overrides: Partial<Professional> = {}): Professional {
  seq += 1
  const category: CategorySlug = overrides.category ?? 'sonorizacao'
  const specs: TechSpecs =
    overrides.specs ??
    {
      category: 'sonorizacao',
      systemType: 'line-array',
      powerWRms: 10000,
      consoleType: 'digital',
      monitoring: 'in-ear',
      micChannels: 16,
      capacityTier: 'grande',
      brands: ['d&b'],
      operatorIncluded: true,
    }
  return {
    id: `p${seq}`,
    slug: `pro-${seq}`,
    name: `Fornecedor ${seq}`,
    avatar: '',
    category,
    providerType: 'empresa',
    specs,
    headline: 'PA line array',
    bio: '',
    description: '',
    location: { state: 'SP', city: 'São Paulo', ibgeCode: '3550308', lat: -23.55, lng: -46.63 },
    priceFrom: 1000,
    priceModel: 'por_diaria',
    rating: 4.5,
    reviewsCount: 10,
    reviews: [],
    services: [],
    gallery: [{ url: '', width: 4, height: 3, alt: '' }],
    availability: {
      weekdays: [5, 6],
      nextAvailableDate: '2026-06-10',
      availableThisWeekend: true,
      bookedDates: [],
    },
    verified: true,
    yearsExperience: 5,
    completedJobs: 50,
    responseTime: '~2h',
    ...overrides,
  }
}

const gerador = (over: Partial<Professional> = {}) =>
  pro({
    category: 'gerador',
    specs: {
      category: 'gerador',
      powerKva: 180,
      fuelType: 'diesel',
      silenced: true,
      phases: 'trifasico',
      atsIncluded: true,
      capacityTier: 'grande',
      brands: ['stemac'],
      operatorIncluded: false,
    },
    ...over,
  })

describe('applyQuery — filters', () => {
  it('filters by category', () => {
    const data = [pro(), gerador(), pro()]
    const res = applyQuery(data, { categories: ['gerador'] })
    expect(res.total).toBe(1)
    expect(res.items[0]!.category).toBe('gerador')
  })

  it('price range is inclusive on both bounds', () => {
    const data = [pro({ priceFrom: 500 }), pro({ priceFrom: 1000 }), pro({ priceFrom: 2000 })]
    const res = applyQuery(data, { priceMin: 500, priceMax: 1000 })
    expect(res.items.map((p) => p.priceFrom).sort((a, b) => a - b)).toEqual([500, 1000])
  })

  it('ratingMin excludes professionals without rating ("Novo")', () => {
    const data = [pro({ rating: 4.8 }), pro({ rating: null }), pro({ rating: 3.0 })]
    const res = applyQuery(data, { ratingMin: 4 })
    expect(res.total).toBe(1)
    expect(res.items[0]!.rating).toBe(4.8)
  })

  it('search is accent- and case-insensitive', () => {
    const data = [pro({ headline: 'Sonorização e VJ' }), gerador({ headline: 'Locação de gerador' })]
    expect(applyQuery(data, { q: 'sonorizacao' }).total).toBe(1)
    expect(applyQuery(data, { q: 'SONORIZAÇÃO' }).total).toBe(1)
  })

  it('filters by enum spec (systemType)', () => {
    const ponto = pro({
      specs: {
        category: 'sonorizacao',
        systemType: 'ponto',
        powerWRms: 2000,
        consoleType: 'analogica',
        monitoring: 'wedge',
        micChannels: 8,
      },
    })
    const res = applyQuery([pro(), ponto], { categories: ['sonorizacao'], specs: { systemType: 'ponto' } })
    expect(res.total).toBe(1)
  })

  it('filters by boolean spec (silenced)', () => {
    const noisy = gerador({
      specs: {
        category: 'gerador',
        powerKva: 100,
        fuelType: 'diesel',
        silenced: false,
        phases: 'mono',
        atsIncluded: false,
      },
    })
    const res = applyQuery([gerador(), noisy], { categories: ['gerador'], specs: { silenced: true } })
    expect(res.total).toBe(1)
    expect((res.items[0]!.specs as { silenced: boolean }).silenced).toBe(true)
  })

  it('treats a numeric spec filter as a minimum threshold (powerKva)', () => {
    const small = gerador({
      specs: {
        category: 'gerador',
        powerKva: 100,
        fuelType: 'diesel',
        silenced: true,
        phases: 'trifasico',
        atsIncluded: true,
      },
    })
    const res = applyQuery([gerador(), small], { categories: ['gerador'], specs: { powerKva: 150 } })
    expect(res.total).toBe(1)
    expect((res.items[0]!.specs as { powerKva: number }).powerKva).toBe(180)
  })

  it('filters by event date (excludes suppliers booked on that date)', () => {
    const free = pro()
    const booked = pro({
      availability: {
        weekdays: [5, 6],
        nextAvailableDate: '2026-07-01',
        availableThisWeekend: true,
        bookedDates: ['2026-07-04'],
      },
    })
    const res = applyQuery([free, booked], { eventDate: '2026-07-04' })
    expect(res.total).toBe(1)
    expect(res.items[0]!.id).toBe(free.id)
  })
})

describe('applyQuery — sorting', () => {
  it('sorts by price ascending', () => {
    const data = [pro({ priceFrom: 3000 }), pro({ priceFrom: 1000 }), pro({ priceFrom: 2000 })]
    const res = applyQuery(data, { sort: 'price-asc' })
    expect(res.items.map((p) => p.priceFrom)).toEqual([1000, 2000, 3000])
  })

  it('sorts by distance using the provided distanceFor', () => {
    const a = pro({ id: 'a' })
    const b = pro({ id: 'b' })
    const c = pro({ id: 'c' })
    const dist: Record<string, number> = { a: 30, b: 5, c: 12 }
    const res = applyQuery([a, b, c], { sort: 'distance-asc' }, { distanceFor: (p) => dist[p.id] })
    expect(res.items.map((p) => p.id)).toEqual(['b', 'c', 'a'])
  })
})

describe('applyQuery — pagination', () => {
  it('paginates without overlap and reports hasMore/total', () => {
    const data = Array.from({ length: 30 }, () => pro())
    const page1 = applyQuery(data, { page: 1, pageSize: 24 })
    const page2 = applyQuery(data, { page: 2, pageSize: 24 })
    expect(page1.items).toHaveLength(24)
    expect(page1.hasMore).toBe(true)
    expect(page1.total).toBe(30)
    expect(page2.items).toHaveLength(6)
    expect(page2.hasMore).toBe(false)
    const ids = new Set([...page1.items, ...page2.items].map((p) => p.id))
    expect(ids.size).toBe(30) // no duplicates across pages
  })
})

describe('applyQuery — facets', () => {
  it('category facet counts are independent of the selected category', () => {
    const data = [pro(), pro(), gerador()]
    const res = applyQuery(data, { categories: ['led'] }) // none are LED
    const byCat = Object.fromEntries(res.facets.categories.map((f) => [f.value, f.count]))
    expect(byCat.sonorizacao).toBe(2)
    expect(byCat.gerador).toBe(1)
    expect(res.facets.categories).toHaveLength(6) // all categories always listed
  })

  it('exposes contextual spec facets when exactly one category is selected', () => {
    const res = applyQuery([gerador(), gerador()], { categories: ['gerador'] })
    expect(res.facets.specs).toBeDefined()
    expect(res.facets.specs!.silenced).toBeDefined()
  })
})

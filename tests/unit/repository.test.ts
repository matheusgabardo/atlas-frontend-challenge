import { describe, expect, it } from 'vitest'
import { getAllProfessionals, getProfessionalBySlug } from '../../server/utils/repository'
import { applyQuery } from '../../shared/catalog/applyQuery'

describe('repository (seeded dataset)', () => {
  it('loads at least 500 professionals', () => {
    expect(getAllProfessionals().length).toBeGreaterThanOrEqual(500)
  })

  it('resolves a professional by slug', () => {
    const first = getAllProfessionals()[0]!
    expect(getProfessionalBySlug(first.slug)?.id).toBe(first.id)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getProfessionalBySlug('does-not-exist')).toBeUndefined()
  })

  it('integrates with applyQuery (category filter over real data)', () => {
    const res = applyQuery(getAllProfessionals(), { categories: ['gerador'] })
    expect(res.total).toBeGreaterThan(0)
    expect(res.items.every((p) => p.category === 'gerador')).toBe(true)
  })
})

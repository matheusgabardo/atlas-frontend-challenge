import { describe, expect, it } from 'vitest'
import { haversineKm } from '../../shared/catalog/distance'

describe('haversineKm', () => {
  it('is zero for the same point', () => {
    expect(haversineKm({ lat: -23.55, lng: -46.63 }, { lat: -23.55, lng: -46.63 })).toBe(0)
  })

  it('matches the known São Paulo → Rio de Janeiro distance (~360 km)', () => {
    const sp = { lat: -23.55, lng: -46.63 }
    const rj = { lat: -22.91, lng: -43.2 }
    const km = haversineKm(sp, rj)
    expect(km).toBeGreaterThan(340)
    expect(km).toBeLessThan(380)
  })

  it('is symmetric', () => {
    const a = { lat: -23.55, lng: -46.63 }
    const b = { lat: -30.03, lng: -51.23 }
    expect(haversineKm(a, b)).toBe(haversineKm(b, a))
  })
})

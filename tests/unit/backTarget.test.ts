import { describe, expect, it } from 'vitest'
import { catalogBackTarget } from '../../app/utils/backTarget'

describe('catalogBackTarget', () => {
  it('goes back when the previous entry is a listing (catalog or favourites)', () => {
    expect(catalogBackTarget('/')).toBe('back')
    expect(catalogBackTarget('/?categories=dj')).toBe('back')
    expect(catalogBackTarget('/?city=São Paulo&sort=preco-asc')).toBe('back')
    expect(catalogBackTarget('/favoritos')).toBe('back')
  })

  it('goes home for deep links or unrelated origins', () => {
    expect(catalogBackTarget('/profissional/joao-dj')).toBe('home')
    expect(catalogBackTarget(undefined)).toBe('home')
    expect(catalogBackTarget(null)).toBe('home')
    expect(catalogBackTarget('')).toBe('home')
  })
})

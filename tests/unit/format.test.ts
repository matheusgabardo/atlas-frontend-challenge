import { describe, expect, it } from 'vitest'
import { formatBRL, formatPrice } from '../../shared/catalog/format'

// Intl uses a non-breaking space between the symbol and the number; normalize it for assertions.
const norm = (s: string) => s.replace(/\s+/g, ' ')

describe('formatBRL', () => {
  it('formats integers as BRL with no decimals and dot thousands', () => {
    expect(norm(formatBRL(1500))).toBe('R$ 1.500')
    expect(norm(formatBRL(800))).toBe('R$ 800')
  })

  it('formatPrice appends the price-model label', () => {
    expect(norm(formatPrice(800, 'por_diaria'))).toBe('a partir de R$ 800/diária')
  })
})

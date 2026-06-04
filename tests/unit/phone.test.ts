import { describe, expect, it } from 'vitest'
import { maskPhone } from '../../app/utils/phone'

describe('maskPhone', () => {
  it('formats a mobile number progressively', () => {
    expect(maskPhone('')).toBe('')
    expect(maskPhone('1')).toBe('(1')
    expect(maskPhone('11')).toBe('(11')
    expect(maskPhone('119')).toBe('(11) 9')
    expect(maskPhone('1199000')).toBe('(11) 9900-0')
    expect(maskPhone('11990001234')).toBe('(11) 99000-1234')
  })

  it('formats a landline and strips non-digits / caps at 11 digits', () => {
    expect(maskPhone('1133334444')).toBe('(11) 3333-4444')
    expect(maskPhone('(11) 99000-1234')).toBe('(11) 99000-1234')
    expect(maskPhone('11990001234567')).toBe('(11) 99000-1234')
    expect(maskPhone('abc11def990')).toBe('(11) 990')
  })
})

// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RangeSlider from '../../app/components/catalog/RangeSlider.vue'

const lastEmit = (w: ReturnType<typeof mount>) =>
  w.emitted('update:modelValue')!.at(-1)![0] as [number, number]

describe('RangeSlider', () => {
  it('moves the min thumb by one step with ArrowRight', async () => {
    const w = mount(RangeSlider, { props: { modelValue: [200, 6000], min: 200, max: 6000, step: 50 } })
    await w.findAll('.range__thumb')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(lastEmit(w)).toEqual([250, 6000])
  })

  it('keeps the thumbs from crossing (min stays below max)', async () => {
    const w = mount(RangeSlider, { props: { modelValue: [5900, 6000], min: 200, max: 6000, step: 50 } })
    await w.findAll('.range__thumb')[0]!.trigger('keydown', { key: 'ArrowRight' }) // would reach 5950
    await w.findAll('.range__thumb')[0]!.trigger('keydown', { key: 'ArrowRight' }) // would reach 6000, clamped
    const [min, max] = lastEmit(w)
    expect(min).toBeLessThanOrEqual(max - 50)
  })

  it('clamps a numeric input into the bounds', async () => {
    const w = mount(RangeSlider, { props: { modelValue: [200, 6000], min: 200, max: 6000, step: 50 } })
    const minInput = w.findAll('input[type="number"]')[0]!
    await minInput.setValue('99999')
    await minInput.trigger('change')
    expect(lastEmit(w)[0]).toBeLessThanOrEqual(6000)
  })
})

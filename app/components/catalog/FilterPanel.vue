<script setup lang="ts">
import { CONTEXTUAL_FACETS } from '~~/shared/catalog/categories'
import type { CatalogFacets, CategorySlug } from '~~/shared/types'
import { ICONS } from '~/utils/icons'

const props = defineProps<{ facets?: CatalogFacets }>()
const { query, update } = useCatalogQuery()

const bounds = computed(() => props.facets?.priceRange ?? { min: 0, max: 10000 })
const price = computed<[number, number]>({
  get: () => [query.value.priceMin ?? bounds.value.min, query.value.priceMax ?? bounds.value.max],
  set: ([lo, hi]) =>
    update({
      priceMin: lo > bounds.value.min ? lo : undefined,
      priceMax: hi < bounds.value.max ? hi : undefined,
    }),
})

const RATINGS: [number, string][] = [
  [4.5, '4.5 ★ ou mais'],
  [4, '4.0 ★ ou mais'],
  [3.5, '3.5 ★ ou mais'],
  [0, 'Qualquer'],
]
const selectedCats = computed<CategorySlug[]>(() => query.value.categories ?? [])

function facetCount(facetId: string, value: string): number {
  return props.facets?.specs?.[facetId]?.find((f) => f.value === value)?.count ?? 0
}
function isSpecOn(facetId: string, value: string, isBool: boolean): boolean {
  const sel = query.value.specs?.[facetId]
  if (isBool) return sel === true
  if (Array.isArray(sel)) return sel.includes(value)
  return sel === value
}
function toggleSpec(facetId: string, value: string, isBool: boolean) {
  let specs: Record<string, string | string[] | boolean> = { ...(query.value.specs ?? {}) }
  const drop = () => {
    specs = Object.fromEntries(Object.entries(specs).filter(([k]) => k !== facetId)) as typeof specs
  }
  if (isBool) {
    if (specs[facetId]) drop()
    else specs[facetId] = true
  } else {
    const cur = Array.isArray(specs[facetId])
      ? [...(specs[facetId] as string[])]
      : specs[facetId]
        ? [specs[facetId] as string]
        : []
    const i = cur.indexOf(value)
    if (i >= 0) cur.splice(i, 1)
    else cur.push(value)
    if (cur.length === 0) drop()
    else specs[facetId] = cur.length === 1 ? cur[0]! : cur
  }
  update({ specs: Object.keys(specs).length ? specs : undefined })
}
</script>

<template>
  <div>
    <template v-if="selectedCats.length">
      <template v-for="cat in selectedCats" :key="cat">
        <div v-for="f in CONTEXTUAL_FACETS[cat]" :key="f.id" class="filter-group">
          <div class="filter-group__title">{{ f.label }}</div>
          <label v-if="f.type === 'bool'" class="switch">
            <span class="switch__label">{{ f.options[0] }}</span>
            <input type="checkbox" :checked="isSpecOn(f.id, 'true', true)" @change="toggleSpec(f.id, 'true', true)">
            <span class="switch__track" />
          </label>
          <label v-for="opt in (f.type === 'multi' ? f.options : [])" v-else :key="opt" class="opt">
            <input type="checkbox" :checked="isSpecOn(f.id, opt, false)" @change="toggleSpec(f.id, opt, false)">
            <span class="opt__box"><AppIcon :d="ICONS.check" /></span>
            <span class="opt__label">{{ opt }}</span>
            <span class="opt__count">{{ facetCount(f.id, opt) }}</span>
          </label>
        </div>
      </template>
    </template>
    <div v-else class="filter-group">
      <div class="filter-group__title">Filtros por especialidade</div>
      <p style="font-size: var(--fs-sm); color: var(--text-3)">
        Escolha uma categoria para ver filtros específicos (estilo, arranjo, tipo de fixture…).
      </p>
    </div>

    <div class="filter-group">
      <div class="filter-group__title">Preço (R$)</div>
      <RangeSlider v-model="price" :min="bounds.min" :max="bounds.max" />
    </div>

    <div class="filter-group">
      <div class="filter-group__title">Avaliação mínima</div>
      <label v-for="[r, label] in RATINGS" :key="r" class="opt">
        <input type="radio" name="rating" :checked="(query.ratingMin ?? 0) === r" @change="update({ ratingMin: r || undefined })">
        <span class="opt__box opt__box--radio" />
        <span class="opt__label">{{ label }}</span>
      </label>
    </div>

    <div class="filter-group">
      <div class="filter-group__title">Disponibilidade & confiança</div>
      <label class="switch">
        <span class="switch__label">Verificado</span>
        <input type="checkbox" :checked="!!query.verified" @change="update({ verified: query.verified ? undefined : true })">
        <span class="switch__track" />
      </label>
      <label class="switch">
        <span class="switch__label">Disponível fim de semana</span>
        <input type="checkbox" :checked="!!query.weekend" @change="update({ weekend: query.weekend ? undefined : true })">
        <span class="switch__track" />
      </label>
      <label class="switch">
        <span class="switch__label">Leva equipamento</span>
        <input type="checkbox" :checked="!!query.operator" @change="update({ operator: query.operator ? undefined : true })">
        <span class="switch__track" />
      </label>
    </div>
  </div>
</template>

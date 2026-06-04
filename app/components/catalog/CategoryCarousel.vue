<script setup lang="ts">
import { CATEGORIES } from '~~/shared/catalog/categories'
import type { CategorySlug } from '~~/shared/types'
import { ICONS } from '~/utils/icons'

const props = defineProps<{
  active?: CategorySlug[]
  counts?: { value: string; count: number }[]
}>()
const emit = defineEmits<{ toggle: [CategorySlug] }>()

const track = ref<HTMLElement>()
const hasOverflow = ref(false)
const canLeft = ref(false)
const canRight = ref(false)
const collapsed = ref(false)
const listId = useId()

function countFor(slug: string): number {
  return props.counts?.find((c) => c.value === slug)?.count ?? 0
}
function isActive(slug: CategorySlug): boolean {
  return props.active?.includes(slug) ?? false
}

// Toggle the side arrows based on the scroll position (overflow only).
function updateArrows() {
  const el = track.value
  if (!el) return
  hasOverflow.value = el.scrollWidth > el.clientWidth + 8
  canLeft.value = el.scrollLeft > 4
  canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}
function scrollByDir(dir: number) {
  const el = track.value
  if (!el) return
  el.scrollBy({ left: dir * Math.max(220, el.clientWidth * 0.7), behavior: 'smooth' })
}

watch(() => props.counts, () => nextTick(updateArrows))
watch(collapsed, () => nextTick(updateArrows))

let ro: ResizeObserver | undefined
onMounted(() => {
  nextTick(updateArrows)
  // ResizeObserver on the track covers viewport/container changes (subsumes window resize).
  if (track.value && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => updateArrows())
    ro.observe(track.value)
  } else {
    window.addEventListener('resize', updateArrows)
  }
  // A web-font swap can widen the pills after mount without firing resize/scroll.
  document.fonts?.ready?.then(() => updateArrows())
})
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('resize', updateArrows)
})
</script>

<template>
  <div class="catbar" :class="{ 'is-collapsed': collapsed }">
    <div class="catbar__row">
      <button
        v-show="!collapsed && hasOverflow"
        type="button"
        class="catbar__nav catbar__nav--prev"
        :disabled="!canLeft"
        aria-label="Categorias anteriores"
        @click="scrollByDir(-1)"
      >
        <AppIcon :d="ICONS.arrowL" />
      </button>

      <div
        :id="listId"
        ref="track"
        class="catpills"
        role="group"
        aria-label="Filtrar por categoria"
        @scroll="updateArrows"
      >
        <button
          v-for="c in CATEGORIES"
          :key="c.slug"
          type="button"
          class="catpill"
          :aria-pressed="isActive(c.slug)"
          @click="emit('toggle', c.slug)"
        >
          <AppIcon :d="c.icon" />
          {{ c.label }} <span class="catpill__count">{{ countFor(c.slug) }}</span>
        </button>
      </div>

      <button
        v-show="!collapsed && hasOverflow"
        type="button"
        class="catbar__nav catbar__nav--next"
        :disabled="!canRight"
        aria-label="Próximas categorias"
        @click="scrollByDir(1)"
      >
        <AppIcon :d="ICONS.arrowR" />
      </button>

      <button
        type="button"
        class="catbar__toggle"
        :aria-expanded="!collapsed"
        :aria-controls="listId"
        :aria-label="collapsed ? 'Mostrar categorias' : 'Minimizar categorias'"
        @click="collapsed = !collapsed"
      >
        <span v-if="collapsed" class="catbar__toggle-txt">
          Categorias<template v-if="active?.length"> ({{ active.length }})</template>
        </span>
        <AppIcon :d="ICONS.chev" />
      </button>
    </div>
  </div>
</template>

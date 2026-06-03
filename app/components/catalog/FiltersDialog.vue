<script setup lang="ts">
import type { CatalogFacets } from '~~/shared/types'
import { ICONS } from '~/utils/icons'

const props = defineProps<{ open: boolean; facets?: CatalogFacets }>()
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement>()
useFocusTrap(() => props.open, panel)

function onKeydown(e: KeyboardEvent) {
  if (props.open && e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <div class="overlay" :data-open="open" role="dialog" aria-modal="true" aria-label="Filtros" @mousedown.self="emit('close')">
    <div ref="panel" class="dialog">
      <div class="dialog__head">
        <div><h2>Filtros</h2></div>
        <button class="dialog__close" aria-label="Fechar filtros" @click="emit('close')"><AppIcon :d="ICONS.x" /></button>
      </div>
      <div class="dialog__body">
        <FilterPanel :facets="facets" />
      </div>
      <div class="dialog__foot">
        <button class="btn btn--primary btn--block" @click="emit('close')">Ver resultados</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaAsset } from '~~/shared/types'
import { ICONS } from '~/utils/icons'

const props = defineProps<{ open: boolean; images: MediaAsset[]; title?: string; start?: number }>()
const emit = defineEmits<{ close: [] }>()

const idx = ref(props.start ?? 0)
const total = computed(() => props.images.length)
const closeBtn = ref<HTMLButtonElement>()

function move(delta: number) {
  if (!total.value) return
  idx.value = (idx.value + delta + total.value) % total.value
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') move(-1)
  else if (e.key === 'ArrowRight') move(1)
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      idx.value = props.start ?? 0
      nextTick(() => closeBtn.value?.focus())
    }
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
  <div class="lightbox" :data-open="open" role="dialog" aria-modal="true" aria-label="Galeria de fotos">
    <div class="lightbox__bar">
      <span class="lightbox__counter">{{ title }}</span>
      <span class="lightbox__counter">foto {{ idx + 1 }} de {{ total }}</span>
      <button ref="closeBtn" class="lb-close" aria-label="Fechar galeria" @click="emit('close')">
        <AppIcon :d="ICONS.x" />
      </button>
    </div>
    <div class="lightbox__stage">
      <button class="lb-nav lb-nav--prev" aria-label="Foto anterior" @click="move(-1)">
        <AppIcon :d="ICONS.arrowL" />
      </button>
      <div class="lightbox__img">
        <img
          v-if="images[idx]"
          :src="images[idx]!.url"
          :alt="images[idx]!.alt"
          style="max-width: 100%; max-height: 78vh; object-fit: contain; border-radius: var(--r-md)"
        >
      </div>
      <button class="lb-nav lb-nav--next" aria-label="Próxima foto" @click="move(1)">
        <AppIcon :d="ICONS.arrowR" />
      </button>
    </div>
    <p class="sr-only" role="status" aria-live="polite">foto {{ idx + 1 }} de {{ total }}</p>
  </div>
</template>

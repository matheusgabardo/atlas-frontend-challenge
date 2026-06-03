<script setup lang="ts">
import { STATES } from '~~/shared/data/cities'
import { ICONS } from '~/utils/icons'

const props = defineProps<{ open: boolean; current?: string }>()
const emit = defineEmits<{ close: []; select: [{ city: string; state: string } | null] }>()

const filter = ref('')
const searchInput = ref<HTMLInputElement>()

const groups = computed(() => {
  const q = filter.value.trim().toLowerCase()
  return Object.keys(STATES)
    .sort()
    .map((uf) => ({ uf, cities: STATES[uf]!.filter((c) => c.toLowerCase().includes(q)).sort() }))
    .filter((g) => g.cities.length)
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      filter.value = ''
      nextTick(() => searchInput.value?.focus())
    }
  },
)

function pick(city: string, uf: string) {
  emit('select', { city, state: uf })
  emit('close')
}
const root = ref<HTMLElement>()
useFocusTrap(() => props.open, root)
function onKeydown(e: KeyboardEvent) {
  if (props.open && e.key === 'Escape') emit('close')
}
function onDocMouseDown(e: MouseEvent) {
  if (!props.open) return
  const t = e.target as HTMLElement
  if (root.value && !root.value.contains(t) && !t.closest('[data-citybtn]')) emit('close')
}
onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onDocMouseDown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousedown', onDocMouseDown)
})
</script>

<template>
  <div ref="root" class="citypop" :data-open="open" role="dialog" aria-label="Selecionar cidade">
    <div class="citypop__search">
      <input ref="searchInput" v-model="filter" type="text" placeholder="Buscar cidade…" aria-label="Buscar cidade">
    </div>
    <div class="citypop__list" role="listbox">
      <button class="citypop__item" @click="emit('select', null); emit('close')">
        Todas as cidades <AppIcon v-if="!current" :d="ICONS.check" />
      </button>
      <template v-for="g in groups" :key="g.uf">
        <div class="citypop__uf">{{ g.uf }}</div>
        <button
          v-for="c in g.cities"
          :key="c"
          class="citypop__item"
          role="option"
          :aria-current="current === c"
          @click="pick(c, g.uf)"
        >
          {{ c }} <AppIcon v-if="current === c" :d="ICONS.check" />
        </button>
      </template>
      <div v-if="!groups.length" class="citypop__uf">Nenhuma cidade encontrada</div>
    </div>
  </div>
</template>

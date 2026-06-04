<script setup lang="ts">
import { ICONS } from '~/utils/icons'

const props = defineProps<{ modelValue: string; options: { value: string; label: string }[] }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const open = ref(false)
const root = ref<HTMLElement>()
const btn = ref<HTMLButtonElement>()
const listbox = ref<HTMLElement>()
const activeIndex = ref(0)

const currentLabel = computed(() => props.options.find((o) => o.value === props.modelValue)?.label ?? '')

function openMenu() {
  open.value = true
  activeIndex.value = Math.max(0, props.options.findIndex((o) => o.value === props.modelValue))
  nextTick(() => listbox.value?.focus())
}
function close(focusBtn = true) {
  open.value = false
  if (focusBtn) nextTick(() => btn.value?.focus())
}
function select(value: string) {
  emit('update:modelValue', value)
  close()
}
function onBtnKeydown(e: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
    e.preventDefault()
    openMenu()
  }
}
function onListKeydown(e: KeyboardEvent) {
  const n = props.options.length
  const keys = ['Escape', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ']
  if (!keys.includes(e.key)) return
  e.preventDefault()
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowDown') activeIndex.value = (activeIndex.value + 1) % n
  else if (e.key === 'ArrowUp') activeIndex.value = (activeIndex.value - 1 + n) % n
  else if (e.key === 'Home') activeIndex.value = 0
  else if (e.key === 'End') activeIndex.value = n - 1
  else select(props.options[activeIndex.value]!.value)
}
function onDocMouseDown(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close(false)
}
onMounted(() => document.addEventListener('mousedown', onDocMouseDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMouseDown))
</script>

<template>
  <div ref="root" class="sortselect">
    <button
      ref="btn"
      type="button"
      class="sortsel sortselect__btn"
      aria-haspopup="listbox"
      aria-label="Ordenar por"
      :aria-expanded="open"
      @click="open ? close() : openMenu()"
      @keydown="onBtnKeydown"
    >
      <span>{{ currentLabel }}</span>
      <AppIcon class="chev" :d="ICONS.chev" />
    </button>
    <ul
      v-show="open"
      ref="listbox"
      class="sortselect__pop"
      role="listbox"
      tabindex="-1"
      :aria-activedescendant="`sort-opt-${activeIndex}`"
      @keydown="onListKeydown"
    >
      <li
        v-for="(o, i) in options"
        :id="`sort-opt-${i}`"
        :key="o.value"
        role="option"
        :aria-selected="o.value === modelValue"
        class="sortselect__opt"
        :class="{ 'is-active': i === activeIndex, 'is-selected': o.value === modelValue }"
        @click="select(o.value)"
        @mousemove="activeIndex = i"
      >
        {{ o.label }}
        <AppIcon v-if="o.value === modelValue" :d="ICONS.check" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sortselect {
  position: relative;
}
.sortselect__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
}
.sortselect__btn .chev {
  width: 16px;
  height: 16px;
  transition: transform 0.15s;
}
.sortselect__btn[aria-expanded='true'] .chev {
  transform: rotate(180deg);
}
.sortselect__pop {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 50;
  min-width: 210px;
  max-width: calc(100vw - 24px);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
  padding: var(--sp-1);
  list-style: none;
}
.sortselect__opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-sm);
  font-size: var(--fs-sm);
  color: var(--text);
  cursor: pointer;
}
.sortselect__opt svg {
  width: 16px;
  height: 16px;
  color: var(--primary);
}
.sortselect__opt.is-active {
  background: var(--surface-2);
}
.sortselect__opt.is-selected {
  color: var(--primary);
  font-weight: 600;
}
</style>

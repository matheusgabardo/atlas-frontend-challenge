<script setup lang="ts">
// Two-thumb price range slider with pointer drag, full keyboard support and numeric inputs.
const props = withDefaults(defineProps<{ min: number; max: number; step?: number }>(), { step: 50 })
const model = defineModel<[number, number]>({ required: true })

const track = ref<HTMLElement>()
const span = computed(() => Math.max(1, props.max - props.min))
const pct = (v: number) => ((v - props.min) / span.value) * 100

function clamp(v: number) {
  const stepped = Math.round(v / props.step) * props.step
  return Math.max(props.min, Math.min(props.max, stepped))
}
function setThumb(thumb: 0 | 1, value: number) {
  const [lo, hi] = model.value
  if (thumb === 0) model.value = [Math.min(value, hi - props.step), hi]
  else model.value = [lo, Math.max(value, lo + props.step)]
}
function startDrag(thumb: 0 | 1, e: PointerEvent) {
  e.preventDefault()
  const move = (ev: PointerEvent) => {
    const r = track.value!.getBoundingClientRect()
    setThumb(thumb, clamp(props.min + ((ev.clientX - r.left) / r.width) * span.value))
  }
  const up = () => {
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerup', up)
  }
  document.addEventListener('pointermove', move)
  document.addEventListener('pointerup', up)
}
function onKey(thumb: 0 | 1, e: KeyboardEvent) {
  const d =
    e.key === 'ArrowRight' || e.key === 'ArrowUp'
      ? props.step
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? -props.step
        : 0
  if (!d) return
  e.preventDefault()
  setThumb(thumb, clamp(model.value[thumb] + d))
}
function onInput(thumb: 0 | 1, e: Event) {
  const raw = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(raw)) setThumb(thumb, clamp(raw))
}
</script>

<template>
  <div class="range">
    <div ref="track" class="range__track">
      <div class="range__fill" :style="{ left: `${pct(model[0])}%`, width: `${pct(model[1]) - pct(model[0])}%` }" />
      <div
        class="range__thumb"
        :style="{ left: `${pct(model[0])}%` }"
        tabindex="0"
        role="slider"
        aria-label="Preço mínimo"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="model[0]"
        @pointerdown="startDrag(0, $event)"
        @keydown="onKey(0, $event)"
      />
      <div
        class="range__thumb"
        :style="{ left: `${pct(model[1])}%` }"
        tabindex="0"
        role="slider"
        aria-label="Preço máximo"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="model[1]"
        @pointerdown="startDrag(1, $event)"
        @keydown="onKey(1, $event)"
      />
    </div>
    <div class="range__inputs">
      <div class="range__field"><input type="number" :value="model[0]" aria-label="Preço mínimo" @change="onInput(0, $event)"></div>
      <span>—</span>
      <div class="range__field"><input type="number" :value="model[1]" aria-label="Preço máximo" @change="onInput(1, $event)"></div>
    </div>
  </div>
</template>

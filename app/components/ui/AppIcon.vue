<script setup lang="ts">
const props = defineProps<{ d: string; fill?: boolean }>()

// Split a multi-subpath `d` (e.g. "M.. M..") into individual <path> elements.
const paths = computed(() => props.d.split(' M').map((p, i) => (i ? `M${p}` : p)))
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :fill="fill ? 'currentColor' : 'none'"
    :stroke="fill ? 'none' : 'currentColor'"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(p, i) in paths" :key="i" :d="p" />
  </svg>
</template>

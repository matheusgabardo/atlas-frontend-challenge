// Favorites are client-only state persisted in localStorage (no backend) — see docs/adr/0005.
// `ready` gates rendering of the heart state until after hydration to avoid a mismatch.

import { defineStore } from 'pinia'

const STORAGE_KEY = 'qfe_favs'

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<string[]>([])
  const ready = ref(false)

  const count = computed(() => ids.value.length)
  const has = (id: string) => ids.value.includes(id)

  function toggle(id: string) {
    const index = ids.value.indexOf(id)
    if (index >= 0) ids.value.splice(index, 1)
    else ids.value.push(id)
  }

  function load() {
    if (!import.meta.client) return
    try {
      ids.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      ids.value = []
    }
    ready.value = true
  }

  if (import.meta.client) {
    watch(ids, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })
  }

  return { ids, ready, count, has, toggle, load }
})

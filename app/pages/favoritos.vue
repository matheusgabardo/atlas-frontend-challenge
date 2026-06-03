<script setup lang="ts">
import { toListItem } from '~~/shared/catalog/format'
import type { MediaAsset, ProfessionalDetail, ProfessionalListItem } from '~~/shared/types'
import { ICONS } from '~/utils/icons'

useHead({ title: 'Favoritos — QuemFaz Eventos' })
const { toggle: toggleTheme } = useTheme()
const favorites = useFavoritesStore()

// Favorites are client-only (localStorage); fetch each saved provider after hydration.
const items = ref<ProfessionalListItem[]>([])
const loading = ref(true)

onMounted(async () => {
  favorites.load()
  const details = await Promise.all(
    favorites.ids.map((slug) =>
      $fetch<ProfessionalDetail>(`/api/professionals/${slug}`).catch(() => null),
    ),
  )
  items.value = details.filter((d): d is ProfessionalDetail => !!d).map((d) => toListItem(d))
  loading.value = false
})

const visible = computed(() => items.value.filter((i) => favorites.has(i.slug)))

const lbOpen = ref(false)
const lbImages = ref<MediaAsset[]>([])
const lbTitle = ref('')
async function onPhotos(id: string) {
  const it = items.value.find((i) => i.id === id)
  if (!it) return
  const detail = await $fetch<ProfessionalDetail>(`/api/professionals/${it.slug}`)
  lbImages.value = detail.gallery
  lbTitle.value = it.name
  lbOpen.value = true
}
const quoteOpen = ref(false)
</script>

<template>
  <div class="app" data-screen-label="Favoritos">
    <header class="header">
      <NuxtLink class="brand" to="/" aria-label="QuemFaz Eventos — início">
        <span class="brand__mark"><img src="/logo-symbol.png" alt="" width="36" height="36"></span>
        <span class="brand__name"><span class="word">quem<span class="faz">faz</span></span><small>Eventos</small></span>
      </NuxtLink>
      <div style="flex: 1" />
      <div class="header__right">
        <button class="theme-toggle" aria-label="Alternar tema" @click="toggleTheme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" /></svg>
        </button>
        <NuxtLink class="pf-back" to="/" aria-label="Voltar à busca"><AppIcon :d="ICONS.back" /><span>Voltar à busca</span></NuxtLink>
      </div>
    </header>

    <div class="shell">
      <div class="results">
        <h1 style="font-family: var(--font-display); font-size: var(--fs-xl); margin-bottom: var(--sp-2)">
          Seus favoritos
        </h1>
        <p v-if="!loading && visible.length" style="color: var(--text-2); margin-bottom: var(--sp-5)">
          {{ visible.length }} profissional(is) salvo(s).
          <button class="btn btn--primary" style="margin-left: var(--sp-3)" @click="quoteOpen = true">
            Solicitar orçamento dos {{ visible.length }}
          </button>
        </p>

        <div v-if="loading" class="grid">
          <div v-for="n in 3" :key="n" class="sk"><div class="sk__media shimmer" /><div class="sk__body"><div class="sk-line shimmer" style="width:40%" /><div class="sk-line shimmer" style="width:80%" /><div class="sk-line shimmer" style="width:60%" /></div></div>
        </div>

        <div v-else-if="!visible.length" class="state">
          <div class="state__icon"><AppIcon :d="ICONS.heart" /></div>
          <h3>Nenhum favorito ainda</h3>
          <p>Toque no ♥ nos cards para salvar profissionais e pedir orçamento em lote.</p>
          <NuxtLink class="btn btn--primary" to="/" style="margin: 0 auto">Explorar profissionais</NuxtLink>
        </div>

        <div v-else class="grid">
          <ProviderCard v-for="item in visible" :key="item.id" :item="item" @photos="onPhotos" />
        </div>
      </div>
    </div>

    <Lightbox :open="lbOpen" :images="lbImages" :title="lbTitle" @close="lbOpen = false" />
    <QuoteModal :open="quoteOpen" :batch-count="visible.length" @close="quoteOpen = false" />
  </div>
</template>

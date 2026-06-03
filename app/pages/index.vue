<script setup lang="ts">
import { CATEGORIES } from '~~/shared/catalog/categories'
import { serializeCatalogQuery } from '~~/shared/catalog/queryParams'
import type { CatalogResponse, CategorySlug, SortOption } from '~~/shared/types'
import { ICONS } from '~/utils/icons'

useHead({ title: 'QuemFaz Eventos — encontre profissionais para o seu evento' })

const { query, update, reset } = useCatalogQuery()
const favorites = useFavoritesStore()
const { toggle: toggleTheme } = useTheme()

// Base params (without page) drive the SSR fetch; "load more" appends extra pages client-side.
const baseParams = computed(() => serializeCatalogQuery({ ...query.value, page: undefined }))

const { data, pending } = await useAsyncData<CatalogResponse>(
  'catalog',
  () => $fetch('/api/professionals', { query: { ...baseParams.value, page: 1 } }),
  { watch: [baseParams] },
)

const items = ref<CatalogResponse['items']>([])
const page = ref(1)
watch(
  data,
  (d) => {
    if (d) {
      items.value = [...d.items]
      page.value = 1
    }
  },
  { immediate: true },
)

const total = computed(() => data.value?.total ?? 0)
const facets = computed(() => data.value?.facets)
const hasMore = computed(() => items.value.length < total.value)

async function loadMore() {
  page.value += 1
  const next = await $fetch<CatalogResponse>('/api/professionals', {
    query: { ...baseParams.value, page: page.value },
  })
  items.value.push(...next.items)
}

// Search (debounced) → URL.
const searchText = ref(query.value.q ?? '')
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchText, (v) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => update({ q: v || undefined }), 200)
})

function catCount(slug: string): number {
  return facets.value?.categories.find((c) => c.value === slug)?.count ?? 0
}
function isCatActive(slug: CategorySlug): boolean {
  return query.value.categories?.includes(slug) ?? false
}
function toggleCat(slug: CategorySlug) {
  const set = new Set(query.value.categories ?? [])
  if (set.has(slug)) set.delete(slug)
  else set.add(slug)
  update({ categories: set.size ? [...set] : undefined })
}

const sort = computed<SortOption>({
  get: () => query.value.sort ?? 'relevancia',
  set: (v) => update({ sort: v }),
})

const cityLabel = computed(() => query.value.city ?? 'Todas as cidades')

const activeFilterCount = computed(() => {
  const q = query.value
  let n = (q.categories?.length ?? 0)
  if (q.priceMin != null || q.priceMax != null) n++
  if (q.ratingMin) n++
  if (q.weekend) n++
  if (q.operator) n++
  if (q.verified) n++
  if (q.city) n++
  if (q.specs) n += Object.keys(q.specs).length
  return n
})

onMounted(() => favorites.load())

function clearAll() {
  reset()
  searchText.value = ''
}

// Overlays (lightbox / quote / filters drawer) — wired in the next iteration.
function onPhotos(_id: string) {}
function onQuote(_id: string) {}
</script>

<template>
  <div class="app" data-screen-label="Catálogo">
    <header class="header">
      <NuxtLink class="brand" to="/" aria-label="QuemFaz Eventos — início">
        <span class="brand__mark"><img src="/logo-symbol.png" alt="" width="36" height="36"></span>
        <span class="brand__name"><span class="word">quem<span class="faz">faz</span></span><small>Eventos</small></span>
      </NuxtLink>

      <div class="search">
        <AppIcon class="search__icon" :d="ICONS.search" />
        <input
          v-model="searchText"
          type="search"
          aria-label="Buscar profissionais"
          placeholder="Buscar profissional, categoria ou estilo: &quot;DJ open format&quot;, &quot;line array&quot;, &quot;valet&quot;…"
        >
      </div>

      <div class="header__right">
        <button class="theme-toggle" aria-label="Alternar tema" @click="toggleTheme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" /></svg>
        </button>
        <button class="citybtn" aria-haspopup="listbox">
          <AppIcon :d="ICONS.pin" />
          <span class="city-label">{{ cityLabel }}</span>
          <AppIcon class="chev" :d="ICONS.chev" />
        </button>
        <button class="favbtn" aria-label="Favoritos">
          <AppIcon :d="ICONS.heart" fill />
          <span v-if="favorites.ready && favorites.count" class="favbtn__count">{{ favorites.count }}</span>
        </button>
      </div>
    </header>

    <div class="filterbar">
      <div class="filterbar__inner">
        <div class="catpills" role="group" aria-label="Filtrar por categoria">
          <button
            v-for="c in CATEGORIES"
            :key="c.slug"
            class="catpill"
            :aria-pressed="isCatActive(c.slug)"
            @click="toggleCat(c.slug)"
          >
            <AppIcon :d="c.icon" />
            {{ c.label }} <span class="catpill__count">{{ catCount(c.slug) }}</span>
          </button>
        </div>
        <div class="fbar">
          <button class="btn-filters">
            <AppIcon :d="ICONS.filter" />
            Filtros <span v-if="activeFilterCount" class="btn-filters__badge">{{ activeFilterCount }}</span>
          </button>
          <div class="fbar__spacer" />
          <div class="toolbar__count"><b>{{ total }}</b> {{ total === 1 ? 'resultado' : 'resultados' }}</div>
          <select v-model="sort" class="sortsel" aria-label="Ordenar por">
            <option value="relevancia">Relevância</option>
            <option value="preco-asc">Preço ↑</option>
            <option value="preco-desc">Preço ↓</option>
            <option value="avaliacao">Melhor avaliação</option>
            <option value="avaliados">Mais avaliados</option>
            <option value="distancia">Distância</option>
          </select>
        </div>
      </div>
    </div>

    <div class="shell">
      <div class="results">
        <div v-if="activeFilterCount" class="chips" style="display:flex">
          <span v-for="c in (query.categories ?? [])" :key="c" class="chip">
            {{ CATEGORIES.find((x) => x.slug === c)?.label }}
            <button class="chip__x" aria-label="Remover categoria" @click="toggleCat(c)"><AppIcon :d="ICONS.x" /></button>
          </span>
          <button class="chips__clear" @click="clearAll">limpar tudo</button>
        </div>

        <p class="sr-only" role="status" aria-live="polite">{{ total }} resultados encontrados</p>

        <div v-if="pending && !items.length" class="grid">
          <div v-for="n in 6" :key="n" class="sk">
            <div class="sk__media shimmer" />
            <div class="sk__body">
              <div class="sk-line shimmer" style="width:40%" />
              <div class="sk-line shimmer" style="width:80%;height:16px" />
              <div class="sk-line shimmer" style="width:60%" />
              <div class="sk-line shimmer" style="width:50%;margin-top:8px" />
            </div>
          </div>
        </div>

        <div v-else-if="!items.length" class="state">
          <div class="state__icon"><AppIcon :d="ICONS.empty" /></div>
          <h3>Nenhum resultado</h3>
          <p>Tente remover alguns filtros ou ampliar a faixa de preço.</p>
          <button class="btn btn--primary" style="margin:0 auto" @click="clearAll">Limpar filtros</button>
        </div>

        <template v-else>
          <div class="grid">
            <ProviderCard
              v-for="item in items"
              :key="item.id"
              :item="item"
              @photos="onPhotos"
              @quote="onQuote"
            />
          </div>
          <div class="loadmore">
            <button v-if="hasMore" class="btn btn--ghost" @click="loadMore">
              Carregar mais ({{ total - items.length }})
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

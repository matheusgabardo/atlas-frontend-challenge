<script setup lang="ts">
import { CATEGORY_LABEL, CONTEXTUAL_FACETS } from '~~/shared/catalog/categories'
import { formatBRL } from '~~/shared/catalog/format'
import { serializeCatalogQuery } from '~~/shared/catalog/queryParams'
import type {
  CatalogResponse,
  CategorySlug,
  MediaAsset,
  ProfessionalDetail,
  SortOption,
} from '~~/shared/types'
import { ICONS } from '~/utils/icons'

definePageMeta({ keepalive: true })

useHead({ title: 'QuemFaz Eventos — encontre profissionais para o seu evento' })

const { query, update, reset } = useCatalogQuery()
const favorites = useFavoritesStore()
const { toggle: toggleTheme } = useTheme()

// SEO: faceted URLs canonicalize to the base and are noindex when any filter is active.
const route = useRoute()
const config = useRuntimeConfig()
useSeoMeta({ robots: () => (Object.keys(route.query).length ? 'noindex, follow' : 'index, follow') })
useHead({ link: [{ rel: 'canonical', href: `${config.public.siteUrl}/` }] })

// Base params (without page) drive the SSR fetch; "load more" appends extra pages client-side.
const baseParams = computed(() => serializeCatalogQuery({ ...query.value, page: undefined }))
// Watch a STABLE string key, not the object. serializeCatalogQuery returns a fresh
// object on every recompute, so watching it by reference would refetch — and reset
// the accumulated "load more" pages — on every popstate/back to an identical URL,
// silently defeating keepalive. The string only changes on a real query (docs/adr/0010).
const baseKey = computed(() => JSON.stringify(baseParams.value))

const { data, pending, error, refresh } = await useAsyncData<CatalogResponse>(
  'catalog',
  () => $fetch('/api/professionals', { query: { ...baseParams.value, page: 1 } }),
  { watch: [baseKey] },
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
  try {
    const next = await $fetch<CatalogResponse>('/api/professionals', {
      query: { ...baseParams.value, page: page.value },
    })
    items.value.push(...next.items)
  } catch {
    page.value -= 1 // revert on failure so the button stays usable
  }
}

// Search (debounced) → URL.
const searchText = ref(query.value.q ?? '')
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchText, (v) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => update({ q: v || undefined }), 200)
})
// Keep the input in sync when the URL changes externally (back/forward, shared link).
watch(
  () => query.value.q,
  (v) => {
    if ((v ?? '') !== searchText.value) searchText.value = v ?? ''
  },
)

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
const SORT_UI = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'preco-asc', label: 'Preço ↑' },
  { value: 'preco-desc', label: 'Preço ↓' },
  { value: 'avaliacao', label: 'Melhor avaliação' },
  { value: 'avaliados', label: 'Mais avaliados' },
  { value: 'distancia', label: 'Distância' },
]

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

// Active-filter chips (with per-chip removal).
const FACET_BY_ID = Object.fromEntries(Object.values(CONTEXTUAL_FACETS).flat().map((f) => [f.id, f]))
function dropKey<T extends Record<string, unknown>>(obj: T, key: string): T {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key)) as T
}
function removeSpec(fid: string, val: string | boolean) {
  let specs: Record<string, string | string[] | boolean> = { ...(query.value.specs ?? {}) }
  const cur = specs[fid]
  if (Array.isArray(cur)) {
    const next = cur.filter((x) => x !== val)
    if (next.length === 0) specs = dropKey(specs, fid)
    else specs[fid] = next.length === 1 ? next[0]! : next
  } else {
    specs = dropKey(specs, fid)
  }
  update({ specs: Object.keys(specs).length ? specs : undefined })
}
const chips = computed(() => {
  const q = query.value
  const out: { key: string; label: string; remove: () => void }[] = []
  for (const c of q.categories ?? []) out.push({ key: `cat:${c}`, label: CATEGORY_LABEL(c), remove: () => toggleCat(c) })
  if (q.city) out.push({ key: 'city', label: q.city, remove: () => onCity(null) })
  if (q.priceMin != null || q.priceMax != null) {
    const label =
      q.priceMin != null && q.priceMax != null
        ? `${formatBRL(q.priceMin)} – ${formatBRL(q.priceMax)}`
        : q.priceMin != null
          ? `a partir de ${formatBRL(q.priceMin)}`
          : `até ${formatBRL(q.priceMax!)}`
    out.push({ key: 'price', label, remove: () => update({ priceMin: undefined, priceMax: undefined }) })
  }
  if (q.ratingMin) out.push({ key: 'rating', label: `${q.ratingMin}★+`, remove: () => update({ ratingMin: undefined }) })
  if (q.verified) out.push({ key: 'verified', label: 'Verificado', remove: () => update({ verified: undefined }) })
  if (q.weekend) out.push({ key: 'weekend', label: 'Fim de semana', remove: () => update({ weekend: undefined }) })
  if (q.operator) out.push({ key: 'operator', label: 'Leva equipamento', remove: () => update({ operator: undefined }) })
  if (q.specs)
    for (const [fid, val] of Object.entries(q.specs)) {
      const vals = Array.isArray(val) ? val : [val]
      for (const v of vals)
        out.push({
          key: `spec:${fid}:${v}`,
          label: v === true ? (FACET_BY_ID[fid]?.options[0] ?? fid) : String(v),
          remove: () => removeSpec(fid, v),
        })
    }
  return out
})

onMounted(() => favorites.load())

// Returning from a profile: briefly highlight the card that was opened (docs/adr/0010).
// The catalog is kept alive, so the list (incl. extra "load more" pages) and the scroll
// position survive; we only flag the card for orientation, respecting reduced motion.
const { consume } = useCatalogReturn()
const returningSlug = ref<string | null>(null)
let returnTimer: ReturnType<typeof setTimeout> | undefined
function flagReturn() {
  const slug = consume()
  if (!slug) return
  returningSlug.value = slug
  clearTimeout(returnTimer)
  returnTimer = setTimeout(() => {
    if (returningSlug.value === slug) returningSlug.value = null
  }, 1800)
}
onActivated(flagReturn)
onBeforeUnmount(() => clearTimeout(returnTimer))

function clearAll() {
  reset()
  searchText.value = ''
}

// Lightbox (gallery quick-view) — fetches the provider's gallery on demand.
const lbOpen = ref(false)
const lbImages = ref<MediaAsset[]>([])
const lbTitle = ref('')
async function onPhotos(id: string) {
  const item = items.value.find((i) => i.id === id)
  if (!item) return
  const detail = await $fetch<ProfessionalDetail>(`/api/professionals/${item.slug}`)
  lbImages.value = detail.gallery
  lbTitle.value = item.name
  lbOpen.value = true
}

// Batch quote from favorites.
const filtersOpen = ref(false)

const cityOpen = ref(false)
function onCity(sel: { city: string; state: string } | null) {
  update(sel ? { city: sel.city, state: sel.state } : { city: undefined, state: undefined })
}
</script>

<template>
  <div class="app" data-screen-label="Catálogo">
    <!-- Header + filterbar pinned together so the filterbar always sits right
         below the header regardless of its (mobile-variable) height. -->
    <div class="topbar">
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
        <button class="citybtn" data-citybtn aria-haspopup="listbox" :aria-expanded="cityOpen" @click="cityOpen = !cityOpen">
          <AppIcon :d="ICONS.pin" />
          <span class="city-label">{{ cityLabel }}</span>
          <AppIcon class="chev" :d="ICONS.chev" />
        </button>
        <NuxtLink class="favbtn" to="/favoritos" aria-label="Favoritos">
          <AppIcon :d="ICONS.heart" fill />
          <span v-if="favorites.ready && favorites.count" class="favbtn__count">{{ favorites.count }}</span>
        </NuxtLink>
      </div>
    </header>

    <CityPicker :open="cityOpen" :current="query.city" @close="cityOpen = false" @select="onCity" />

    <div class="filterbar">
      <div class="filterbar__inner">
        <CategoryCarousel :active="query.categories" :counts="facets?.categories" @toggle="toggleCat" />
        <div class="fbar">
          <button class="btn-filters" @click="filtersOpen = true">
            <AppIcon :d="ICONS.filter" />
            Filtros <span v-if="activeFilterCount" class="btn-filters__badge">{{ activeFilterCount }}</span>
          </button>
          <div class="fbar__spacer" />
          <div class="toolbar__count"><b>{{ total }}</b> {{ total === 1 ? 'resultado' : 'resultados' }}</div>
          <SortSelect :model-value="sort" :options="SORT_UI" @update:model-value="(v) => (sort = v as SortOption)" />
        </div>
      </div>
    </div>
    </div>

    <div class="shell">
      <div class="results">
        <div v-if="chips.length" class="chips" style="display: flex">
          <span v-for="c in chips" :key="c.key" class="chip">
            {{ c.label }}
            <button class="chip__x" :aria-label="`Remover ${c.label}`" @click="c.remove()"><AppIcon :d="ICONS.x" /></button>
          </span>
          <button class="chips__clear" @click="clearAll">limpar tudo</button>
        </div>

        <p class="sr-only" role="status" aria-live="polite">{{ total }} resultados encontrados</p>

        <div v-if="error && !items.length" class="state">
          <div class="state__icon"><AppIcon :d="ICONS.empty" /></div>
          <h3>Não foi possível carregar</h3>
          <p>Tivemos um problema ao buscar os profissionais.</p>
          <button class="btn btn--primary" style="margin: 0 auto" @click="refresh()">Tentar de novo</button>
        </div>

        <div v-else-if="pending && !items.length" class="grid">
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
              v-for="(item, i) in items"
              :key="item.id"
              :item="item"
              :eager="i < 4"
              :highlight="item.slug === returningSlug"
              @photos="onPhotos"
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

    <FiltersDialog :open="filtersOpen" :facets="facets" @close="filtersOpen = false" />
    <Lightbox :open="lbOpen" :images="lbImages" :title="lbTitle" @close="lbOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { CATEGORY_LABEL, CONTEXTUAL_FACETS, PROVIDER_TYPES } from '~~/shared/catalog/categories'
import { formatBRL } from '~~/shared/catalog/format'
import { PRICE_MODEL_LABEL } from '~~/shared/catalog/labels'
import type { ProfessionalDetail } from '~~/shared/types'
import { ICONS } from '~/utils/icons'
import { catalogBackTarget } from '~/utils/backTarget'

const route = useRoute()
const router = useRouter()
const { requestReturn } = useCatalogReturn()
const slug = computed(() => route.params.slug as string)

function goBack() {
  // Signal an explicit return so the catalog restores its scroll/highlight (docs/adr/0010).
  requestReturn()
  // Came from a listing → router.back() restores the exact scroll & loaded pages.
  // Deep link or other origin → go to a fresh catalog.
  const back = import.meta.client ? (window.history.state?.back as string | undefined) : undefined
  if (catalogBackTarget(back) === 'back') router.back()
  else navigateTo('/')
}

const { data: pro } = await useFetch<ProfessionalDetail>(() => `/api/professionals/${slug.value}`)
if (!pro.value) {
  throw createError({ statusCode: 404, statusMessage: 'Profissional não encontrado', fatal: true })
}

const p = computed(() => pro.value!)
const favorites = useFavoritesStore()
const { toggle: toggleTheme } = useTheme()

const initials = computed(() =>
  p.value.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase(),
)

const isFav = computed(() => favorites.ready && favorites.has(p.value.slug))

const specRows = computed<[string, string][]>(() => {
  const rows: [string, string][] = []
  for (const facet of CONTEXTUAL_FACETS[p.value.category] ?? []) {
    const v = p.value.specs[facet.id]
    if (v == null) continue
    rows.push([facet.label, facet.type === 'bool' ? (v ? 'Sim' : 'Não') : String(v)])
  }
  if (p.value.specs.experiencia) rows.push(['Experiência', String(p.value.specs.experiencia)])
  rows.push(['Leva equipamento', p.value.operator ? 'Sim' : 'Não'])
  rows.push(['Fim de semana', p.value.weekend ? 'Disponível' : 'Sob consulta'])
  return rows
})

const gallery = computed(() => p.value.gallery)
const monthYear = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(iso))
const starsFor = (rating: number) => Array.from({ length: 5 }, (_, i) => i < Math.round(rating))

onMounted(() => favorites.load())

// SEO
const config = useRuntimeConfig()
const canonical = computed(() => `${config.public.siteUrl}/profissional/${slug.value}`)
useSeoMeta({
  title: () => `${p.value.name} — QuemFaz Eventos`,
  description: () => `${CATEGORY_LABEL(p.value.category)} em ${p.value.location.city}/${p.value.location.state}. ${p.value.headline}`,
  ogTitle: () => p.value.name,
  ogDescription: () => p.value.headline,
  ogImage: () => p.value.gallery[0]?.url,
  ogType: 'website',
})
useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: p.value.name,
        image: p.value.gallery[0]?.url,
        url: canonical.value,
        areaServed: { '@type': 'City', name: p.value.location.city },
        address: {
          '@type': 'PostalAddress',
          addressLocality: p.value.location.city,
          addressRegion: p.value.location.state,
          addressCountry: 'BR',
        },
        makesOffer: { '@type': 'Offer', priceCurrency: 'BRL', price: p.value.priceFrom },
        ...(p.value.rating
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: p.value.rating,
                reviewCount: p.value.reviewsCount,
              },
            }
          : {}),
      }),
    },
  ],
}))

// Lightbox (gallery) + quote modal.
const lbOpen = ref(false)
const lbStart = ref(0)
function openLb(i: number) {
  lbStart.value = i
  lbOpen.value = true
}

const quoteOpen = ref(false)
const quoteSingle = computed(() => ({
  name: p.value.name,
  sub: `${CATEGORY_LABEL(p.value.category)} · ${p.value.location.city}/${p.value.location.state} · a partir de ${formatBRL(p.value.priceFrom)}/${PRICE_MODEL_LABEL[p.value.priceModel]}`,
}))
function onQuote() {
  quoteOpen.value = true
}
</script>

<template>
  <div class="pf" data-screen-label="Perfil do profissional">
    <header class="pf-header">
      <NuxtLink class="brand" to="/" aria-label="QuemFaz Eventos — início">
        <span class="brand__mark"><img src="/logo-symbol.png" alt="" width="36" height="36"></span>
        <span class="brand__name"><span class="word">quem<span class="faz">faz</span></span><small>Eventos</small></span>
      </NuxtLink>
      <div class="pf-header__right">
        <button class="theme-toggle" aria-label="Alternar tema" @click="toggleTheme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" /></svg>
        </button>
      </div>
    </header>

    <main class="pf-wrap">
      <button type="button" class="pf-back pf-back--top" aria-label="Voltar à busca" @click="goBack">
        <AppIcon :d="ICONS.back" />
        <span>Voltar à busca</span>
      </button>
      <nav class="breadcrumb">
        <NuxtLink to="/">Início</NuxtLink><AppIcon :d="ICONS.chev" />
        <NuxtLink :to="`/?categories=${p.category}`">{{ CATEGORY_LABEL(p.category) }}</NuxtLink><AppIcon :d="ICONS.chev" />
        <span class="cur">{{ p.name }}</span>
      </nav>

      <div class="gallery">
        <div
          v-for="(img, i) in gallery.slice(0, 5)"
          :key="i"
          class="gallery__cell"
          role="button"
          tabindex="0"
          @click="openLb(i)"
          @keydown.enter="openLb(i)"
        >
          <NuxtImg :src="img.url" :alt="img.alt" :width="img.width" :height="img.height" sizes="50vw md:33vw" loading="lazy" />
        </div>
        <button class="gallery__more" @click="openLb(0)"><AppIcon :d="ICONS.image" /> ver todas as {{ gallery.length }} fotos</button>
      </div>

      <div class="pf-grid">
        <div class="pf-left">
          <div class="pf-id">
            <div class="pf-id__avatar">{{ initials }}</div>
            <div class="pf-id__main">
              <div class="pf-cat">{{ CATEGORY_LABEL(p.category) }}<span class="pf-type">{{ PROVIDER_TYPES[p.providerType] }}</span></div>
              <h1>{{ p.name }}</h1>
              <div class="pf-meta">
                <span v-if="p.rating" class="rating"><AppIcon :d="ICONS.star" fill /> {{ p.rating.toFixed(1) }} <span style="color:var(--text-3);font-weight:500">({{ p.reviewsCount }} avaliações)</span></span>
                <span v-else class="rating--new"><AppIcon :d="ICONS.star" /> Novo</span>
                <span class="dot" />
                <span class="loc"><AppIcon :d="ICONS.pin" /> {{ p.location.city }}/{{ p.location.state }}<template v-if="p.distanceKm != null"> · {{ p.distanceKm }} km</template></span>
                <span class="dot" />
                <span class="resp"><AppIcon :d="ICONS.clock" /> responde em {{ p.responseTime }}</span>
                <span v-if="p.verified" class="badge-verified"><AppIcon :d="ICONS.verified" /> Verificado</span>
              </div>
            </div>
          </div>

          <section class="pf-section">
            <h2>Sobre</h2>
            <p class="lead">{{ p.description }}</p>
          </section>

          <section class="pf-section">
            <h2>Especialidades</h2>
            <dl class="spec-grid">
              <div v-for="[k, v] in specRows" :key="k" class="spec-row"><dt>{{ k }}</dt><dd>{{ v }}</dd></div>
            </dl>
          </section>

          <section class="pf-section">
            <h2>Serviços</h2>
            <div v-for="s in p.services" :key="s.name" class="svc">
              <div class="svc__info"><div class="svc__name">{{ s.name }}</div><div class="svc__desc">{{ s.description }}</div></div>
              <div class="svc__price"><b>{{ formatBRL(s.priceFrom) }}</b><small>a partir de</small></div>
            </div>
          </section>

          <section class="pf-section">
            <h2>Avaliações</h2>
            <template v-if="p.reviews.length">
              <div class="rev-summary">
                <div class="rev-summary__num">{{ p.rating?.toFixed(1) }}</div>
                <div>
                  <span class="rev-summary__stars"><AppIcon v-for="(on, i) in starsFor(p.rating ?? 0)" :key="i" :d="ICONS.star" :fill="on" /></span>
                  <div class="rev-summary__count">{{ p.reviewsCount }} avaliações de quem contratou</div>
                </div>
              </div>
              <div v-for="(rv, i) in p.reviews" :key="i" class="review">
                <div class="review__head">
                  <div class="review__av">{{ rv.author[0] }}</div>
                  <div class="review__who"><div class="review__name">{{ rv.author }}</div><div class="review__date">{{ monthYear(rv.date) }}</div></div>
                  <span class="review__stars"><AppIcon v-for="(on, j) in starsFor(rv.rating)" :key="j" :d="ICONS.star" :fill="on" /></span>
                </div>
                <p class="review__txt">{{ rv.comment }}</p>
                <span v-if="rv.eventType" class="review__tag">{{ rv.eventType }}</span>
              </div>
            </template>
            <p v-else class="lead">Ainda sem avaliações — este profissional é <b>novo</b> na QuemFaz. Que tal ser o primeiro a contratar?</p>
          </section>
        </div>

        <aside>
          <div class="booking">
            <div class="booking__price"><small>a partir de</small><b>{{ formatBRL(p.priceFrom) }}</b><em>/ {{ PRICE_MODEL_LABEL[p.priceModel] }}</em></div>
            <div class="booking__meta">
              <div v-if="p.verified" class="booking__row"><AppIcon :d="ICONS.verified" /> <span><b>Verificado</b> pela QuemFaz</span></div>
              <div class="booking__row"><AppIcon :d="ICONS.clock" /> <span>Responde em <b>{{ p.responseTime }}</b></span></div>
              <div class="booking__row"><AppIcon :d="ICONS.calendar" /> <span>{{ p.weekend ? 'Disponível neste fim de semana' : 'Fim de semana sob consulta' }}</span></div>
              <div class="booking__row"><AppIcon :d="ICONS.box" /> <span>{{ p.operator ? 'Leva o próprio equipamento' : 'Equipamento sob demanda' }}</span></div>
            </div>
            <div class="booking__actions">
              <button class="btn btn--primary btn--block" @click="onQuote">Solicitar orçamento</button>
              <button class="btn btn--ghost btn--block" :aria-pressed="isFav" @click="favorites.toggle(p.slug)">
                <AppIcon :d="ICONS.heart" fill /> <span>{{ isFav ? 'Salvo nos favoritos' : 'Adicionar aos favoritos' }}</span>
              </button>
            </div>
            <p class="booking__note">Sem compromisso · resposta normalmente em até 24h</p>
          </div>
        </aside>
      </div>
    </main>

    <Lightbox :open="lbOpen" :images="p.gallery" :title="p.name" :start="lbStart" @close="lbOpen = false" />
    <QuoteModal :open="quoteOpen" :single="quoteSingle" @close="quoteOpen = false" />
  </div>
</template>

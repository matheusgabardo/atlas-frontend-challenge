<script setup lang="ts">
import type { ProfessionalListItem } from '~~/shared/types'
import { CATEGORY_LABEL, PROVIDER_TYPES } from '~~/shared/catalog/categories'
import { formatBRL } from '~~/shared/catalog/format'
import { PRICE_MODEL_LABEL } from '~~/shared/catalog/labels'
import { ICONS } from '~/utils/icons'

const props = defineProps<{ item: ProfessionalListItem; eager?: boolean }>()
const emit = defineEmits<{ photos: [string]; quote: [string] }>()

const favorites = useFavoritesStore()
// Render the heart state only after hydration to avoid a mismatch (localStorage is client-only).
const isFav = computed(() => favorites.ready && favorites.has(props.item.slug))
</script>

<template>
  <article class="card">
    <div class="card__media">
      <NuxtImg
        :src="item.thumbnail.url"
        :alt="item.thumbnail.alt"
        :width="item.thumbnail.width"
        :height="item.thumbnail.height"
        sizes="100vw sm:50vw md:33vw lg:25vw"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'auto'"
      />
      <span v-if="item.verified" class="badge-verified"><AppIcon :d="ICONS.verified" /> Verificado</span>
      <button
        class="card__fav"
        :aria-pressed="isFav"
        :aria-label="isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        @click="favorites.toggle(item.slug)"
      >
        <AppIcon :d="ICONS.heart" fill />
      </button>
      <button class="card__photos" type="button" @click="emit('photos', item.id)">
        <AppIcon :d="ICONS.image" /> {{ item.galleryCount }} fotos
      </button>
    </div>

    <div class="card__body">
      <div class="card__cat">
        {{ CATEGORY_LABEL(item.category) }}<span class="card__type">{{ PROVIDER_TYPES[item.providerType] }}</span>
      </div>
      <h3 class="card__name">
        <NuxtLink :to="`/profissional/${item.slug}`">{{ item.name }}</NuxtLink>
      </h3>
      <div class="specs">
        <span v-for="s in item.keySpecs" :key="s" class="spec">{{ s }}</span>
      </div>
      <div class="card__meta">
        <span v-if="item.rating" class="rating">
          <AppIcon :d="ICONS.star" fill />{{ item.rating.toFixed(1) }} <span>({{ item.reviewsCount }})</span>
        </span>
        <span v-else class="rating--new"><AppIcon :d="ICONS.star" /> Novo</span>
        <span class="dot" />
        <span class="loc">
          <AppIcon :d="ICONS.pin" />{{ item.city }}<template v-if="item.distanceKm != null"> · {{ item.distanceKm }} km</template>
        </span>
      </div>
      <div class="card__foot">
        <div class="price">
          <small>a partir de</small><b>{{ formatBRL(item.priceFrom) }}</b><em>/ {{ PRICE_MODEL_LABEL[item.priceModel] }}</em>
        </div>
        <NuxtLink class="btn btn--primary" :to="`/profissional/${item.slug}`">Ver mais detalhes</NuxtLink>
      </div>
    </div>
  </article>
</template>

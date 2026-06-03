/**
 * Seed script — generates the catalog dataset (>= 500 freelancers) into
 * server/data/professionals.json.
 *
 * Deterministic (fixed Faker seed) and offline: build and runtime never call external APIs
 * (see docs/adr/0006). Image URLs are static (picsum/randomuser) and fetched by the browser.
 *
 * Run: npm run seed
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { CATEGORIES, CONTEXTUAL_FACETS } from '../shared/catalog/categories'
import { CITIES } from '../shared/data/cities'
import type { CategorySlug } from '../shared/types/category'
import type { SpecValue } from '../shared/types/specs'
import type {
  Availability,
  MediaAsset,
  PriceModel,
  Professional,
  ProviderType,
  Review,
  Service,
} from '../shared/types/professional'

const COUNT = 540
const REF_DATE = '2026-06-01'
faker.seed(20260603)

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../server/data/professionals.json')

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const PRICE_RANGE: Record<CategorySlug, [number, number]> = {
  dj: [800, 3500],
  som: [1500, 9000],
  luz: [1500, 9000],
  foto: [1200, 6000],
  bar: [250, 1500],
  recepcao: [250, 1400],
  seguranca: [300, 2500],
  cerimonial: [1500, 9000],
  valet: [800, 4000],
}

function genSpecs(cat: CategorySlug): Record<string, SpecValue> {
  const specs: Record<string, SpecValue> = {}
  for (const facet of CONTEXTUAL_FACETS[cat]) {
    specs[facet.id] = facet.type === 'bool' ? faker.datatype.boolean(0.5) : faker.helpers.arrayElement(facet.options)
  }
  specs.experiencia = `${faker.number.int({ min: 1, max: 18 })} anos`
  return specs
}

function buildKeySpecs(cat: CategorySlug, specs: Record<string, SpecValue>): string[] {
  const out: string[] = []
  for (const facet of CONTEXTUAL_FACETS[cat]) {
    if (facet.type === 'multi' && typeof specs[facet.id] === 'string') out.push(specs[facet.id] as string)
    else if (facet.type === 'bool' && specs[facet.id] === true) out.push(facet.options[0]!.toLowerCase())
  }
  if (out.length < 2) out.push(String(specs.experiencia))
  return out.slice(0, 2)
}

function nameFor(cat: CategorySlug, type: ProviderType): string {
  if (type === 'equipe') {
    return `${faker.helpers.arrayElement(['Equipe', 'Studio', 'Cia', 'Grupo', 'Coletivo'])} ${faker.person.lastName()}`
  }
  if (cat === 'dj') return `DJ ${faker.person.firstName()} ${faker.person.lastName()}`
  return faker.person.fullName()
}

function avatarFor(type: ProviderType): string {
  if (type === 'equipe') return '' // team: UI renders initials + color
  const gender = faker.helpers.arrayElement(['men', 'women'])
  return `https://randomuser.me/api/portraits/${gender}/${faker.number.int({ min: 0, max: 99 })}.jpg`
}

function galleryFor(slug: string, label: string): MediaAsset[] {
  const count = faker.number.int({ min: 4, max: 9 })
  return Array.from({ length: count }, (_, i) => ({
    url: `https://picsum.photos/seed/${slug}-${i}/900/600`,
    width: 900,
    height: 600,
    alt: `${label} — foto ${i + 1}`,
  }))
}

function genReviews(): { reviews: Review[]; rating: number | null; total: number } {
  const total = faker.datatype.boolean(0.85) ? faker.number.int({ min: 1, max: 60 }) : 0
  const reviews: Review[] = Array.from({ length: Math.min(total, 12) }, () => ({
    author: `${faker.person.firstName()} ${faker.person.lastName().charAt(0)}.`,
    rating: faker.number.int({ min: 3, max: 5 }),
    comment: faker.lorem.sentence(),
    date: faker.date.recent({ days: 365, refDate: REF_DATE }).toISOString().slice(0, 10),
    eventType: faker.helpers.arrayElement(['Casamento', 'Corporativo', 'Aniversário', 'Show', 'Formatura']),
  }))
  const rating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null
  return { reviews, rating, total }
}

function genAvailability(): Availability {
  const weekdays = faker.helpers.arrayElements([0, 1, 2, 3, 4, 5, 6], { min: 3, max: 7 }).sort()
  const bookedDates = [
    ...new Set(
      Array.from({ length: faker.number.int({ min: 0, max: 8 }) }, () =>
        faker.date.soon({ days: 90, refDate: REF_DATE }).toISOString().slice(0, 10),
      ),
    ),
  ]
  return {
    weekdays,
    nextAvailableDate: faker.date.soon({ days: 14, refDate: REF_DATE }).toISOString().slice(0, 10),
    bookedDates,
  }
}

function genServices(priceFrom: number, priceModel: PriceModel): Service[] {
  const labels = ['Essencial', 'Completo', 'Premium', 'Personalizado']
  const count = faker.number.int({ min: 2, max: 4 })
  return Array.from({ length: count }, (_, i) => ({
    name: `Pacote ${labels[i] ?? 'Extra'}`,
    description: faker.lorem.sentence(),
    priceFrom: Math.round((priceFrom * (1 + i * 0.5)) / 50) * 50,
    priceModel,
  }))
}

const professionals: Professional[] = []
const usedSlugs = new Set<string>()

for (let i = 0; i < COUNT; i++) {
  const category = CATEGORIES[i % CATEGORIES.length]!
  const city = faker.helpers.weightedArrayElement(CITIES.map((c) => ({ weight: c.weight, value: c })))
  const providerType = faker.helpers.weightedArrayElement([
    { weight: 70, value: 'pessoa' as const },
    { weight: 30, value: 'equipe' as const },
  ])
  const specs = genSpecs(category.slug)
  const name = nameFor(category.slug, providerType)

  let slug = slugify(name)
  let candidate = slug
  let n = 1
  while (usedSlugs.has(candidate)) candidate = `${slug}-${++n}`
  slug = candidate
  usedSlugs.add(slug)

  const [lo, hi] = PRICE_RANGE[category.slug]
  const priceFrom = Math.round(faker.number.int({ min: lo, max: hi }) / 50) * 50
  const priceModel = faker.helpers.weightedArrayElement([
    { weight: 70, value: 'evento' as const },
    { weight: 20, value: 'diaria' as const },
    { weight: 10, value: 'hora' as const },
  ])
  const { reviews, rating, total } = genReviews()

  professionals.push({
    id: `prof-${i + 1}`,
    slug,
    name,
    avatar: avatarFor(providerType),
    category: category.slug,
    providerType,
    keySpecs: buildKeySpecs(category.slug, specs),
    specs,
    headline: `${category.label}${providerType === 'equipe' ? ' · equipe' : ''} em ${city.city}`,
    bio: faker.lorem.sentence(),
    description: faker.lorem.paragraphs(2),
    location: { state: city.state, city: city.city, lat: city.lat, lng: city.lng },
    priceFrom,
    priceModel,
    rating,
    reviewsCount: total,
    reviews,
    services: genServices(priceFrom, priceModel),
    gallery: galleryFor(slug, category.label),
    availability: genAvailability(),
    verified: faker.datatype.boolean(0.55),
    weekend: faker.datatype.boolean(0.7),
    operator: faker.datatype.boolean(0.5),
    yearsExperience: faker.number.int({ min: 1, max: 18 }),
    completedJobs: faker.number.int({ min: 3, max: 400 }),
    responseTime: faker.helpers.arrayElement(['~1h', '~2h', '~4h', 'no mesmo dia']),
  })
}

if (professionals.length < 500) {
  console.error(`Seed produced only ${professionals.length} (< 500). Aborting.`)
  process.exit(1)
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(professionals))
console.log(`✓ Wrote ${professionals.length} professionals to ${OUT}`)

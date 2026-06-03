/**
 * Seed script — generates the catalog dataset (>= 500 suppliers) into
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
import { CATEGORIES } from '../shared/catalog/categories'
import { CITIES } from '../shared/data/cities'
import type { CategorySlug } from '../shared/types/category'
import type { CapacityTier, TechSpecs } from '../shared/types/specs'
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
faker.seed(20260602)

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

const TIERS: { value: CapacityTier; weight: number }[] = [
  { value: 'pequeno', weight: 30 },
  { value: 'medio', weight: 40 },
  { value: 'grande', weight: 25 },
  { value: 'open-air', weight: 5 },
]
const AUDIENCE: Record<CapacityTier, [number, number]> = {
  pequeno: [50, 150],
  medio: [150, 600],
  grande: [600, 5000],
  'open-air': [5000, 40000],
}
const TIER_MULT: Record<CapacityTier, number> = { pequeno: 1, medio: 2, grande: 4, 'open-air': 8 }
const BASE_PRICE: Record<CategorySlug, number> = {
  sonorizacao: 800,
  iluminacao: 1200,
  led: 2500,
  projecao: 1500,
  palco: 2000,
  gerador: 600,
}

const SOUND_BRANDS = ['d&b', 'L-Acoustics', 'Meyer Sound', 'JBL', 'RCF', 'Yamaha', 'Behringer']
const LIGHT_BRANDS = ['Chauvet', 'Martin', 'Robe', 'ADJ', 'Elation']
const LED_BRANDS = ['Absen', 'Novastar', 'Unilumin', 'LianTronics']
const GEN_BRANDS = ['Stemac', 'Cummins', 'Heimer', 'Caterpillar']

const SYSTEM_LABEL: Record<string, string> = {
  'line-array': 'Line array',
  ponto: 'Som em ponto',
  coluna: 'Coluna',
}
const STRUCTURE_LABEL: Record<string, string> = {
  'palco-modular': 'Palco modular',
  'trelica-grid': 'Treliça/grid',
  'ground-support': 'Ground support',
  praticavel: 'Praticável',
}

function genSpecs(category: CategorySlug, tier: CapacityTier, audienceMax: number): TechSpecs {
  const common = { capacityTier: tier, audienceMax, operatorIncluded: faker.datatype.boolean(0.7) }
  switch (category) {
    case 'sonorizacao':
      return {
        category,
        ...common,
        brands: faker.helpers.arrayElements(SOUND_BRANDS, { min: 1, max: 3 }),
        systemType: tier === 'pequeno' ? faker.helpers.arrayElement(['ponto', 'coluna']) : 'line-array',
        powerWRms: faker.number.int({ min: 1000 * TIER_MULT[tier], max: 8000 * TIER_MULT[tier] }),
        consoleType: faker.helpers.arrayElement(['digital', 'digital', 'analogica']),
        monitoring: faker.helpers.arrayElement(['wedge', 'in-ear', 'ambos']),
        micChannels: faker.helpers.arrayElement([8, 12, 16, 24, 32, 48, 64]),
      }
    case 'iluminacao':
      return {
        category,
        ...common,
        brands: faker.helpers.arrayElements(LIGHT_BRANDS, { min: 1, max: 2 }),
        fixtureTypes: faker.helpers.arrayElements(
          ['moving-beam', 'moving-wash', 'moving-spot', 'par-led', 'strobo', 'laser'],
          { min: 2, max: 4 },
        ),
        fixtureCount: faker.number.int({ min: 8, max: 16 * TIER_MULT[tier] }),
        trussType: faker.helpers.arrayElement(['q30', 'q50', 'box']),
        hazer: faker.datatype.boolean(0.6),
        pixelMappingCapable: faker.datatype.boolean(0.4),
      }
    case 'led': {
      const environment = faker.helpers.arrayElement(['indoor', 'outdoor'] as const)
      return {
        category,
        ...common,
        brands: faker.helpers.arrayElements(LED_BRANDS, { min: 1, max: 2 }),
        environment,
        pixelPitch: faker.helpers.arrayElement([1.5, 1.9, 2.6, 3.9, 4.8, 6, 10]),
        areaM2: faker.number.int({ min: 6, max: 40 * TIER_MULT[tier] }),
        brightnessNits:
          environment === 'outdoor'
            ? faker.number.int({ min: 4000, max: 7500 })
            : faker.number.int({ min: 800, max: 2000 }),
        format: faker.helpers.arrayElement(['parede', 'totem', 'piso', 'criativo']),
      }
    }
    case 'projecao':
      return {
        category,
        ...common,
        projectorLumens: faker.helpers.arrayElement([5000, 7000, 10000, 15000, 20000, 30000]),
        projectorCount: faker.number.int({ min: 1, max: 6 }),
        mappingCapable: faker.datatype.boolean(0.5),
        screenType: faker.helpers.arrayElement(['frontal', 'retro', 'superficie']),
        screenSizeM: faker.number.int({ min: 3, max: 20 }),
      }
    case 'palco':
      return {
        category,
        ...common,
        structureType: faker.helpers.arrayElement([
          'palco-modular',
          'trelica-grid',
          'ground-support',
          'praticavel',
        ]),
        stageAreaM2: faker.number.int({ min: 20, max: 80 * TIER_MULT[tier] }),
        roofIncluded: faker.datatype.boolean(0.6),
        maxLoadKg: faker.number.int({ min: 500, max: 8000 }),
      }
    case 'gerador':
      return {
        category,
        ...common,
        brands: faker.helpers.arrayElements(GEN_BRANDS, { min: 1, max: 2 }),
        powerKva: faker.helpers.arrayElement([40, 60, 80, 120, 180, 260, 380, 500]),
        fuelType: faker.helpers.arrayElement(['diesel', 'diesel', 'gasolina']),
        silenced: faker.datatype.boolean(0.75),
        phases: faker.helpers.arrayElement(['mono', 'trifasico']),
        atsIncluded: faker.datatype.boolean(0.5),
      }
    default:
      throw new Error(`Unknown category: ${category}`)
  }
}

function headlineFor(category: CategorySlug, specs: TechSpecs): string {
  const s = specs as Record<string, never> & Record<string, string | number | boolean>
  switch (category) {
    case 'sonorizacao':
      return `${SYSTEM_LABEL[s.systemType as string]} · até ${s.audienceMax} pessoas`
    case 'iluminacao':
      return `${s.fixtureCount} fixtures · treliça ${String(s.trussType).toUpperCase()}`
    case 'led':
      return `Painel LED P${s.pixelPitch} · ${s.areaM2} m² · ${s.environment}`
    case 'projecao':
      return `Projeção ${s.projectorLumens} lúmens${s.mappingCapable ? ' · mapping' : ''}`
    case 'palco':
      return `${STRUCTURE_LABEL[s.structureType as string]} · ${s.stageAreaM2} m²`
    case 'gerador':
      return `Gerador ${s.powerKva} kVA${s.silenced ? ' silenciado' : ''}`
    default:
      return ''
  }
}

function priceFor(category: CategorySlug, tier: CapacityTier): number {
  const base = BASE_PRICE[category] * TIER_MULT[tier]
  const value = base * faker.number.float({ min: 0.8, max: 1.4 })
  return Math.round(value / 50) * 50
}

function nameFor(providerType: ProviderType): string {
  if (providerType === 'pessoa') return faker.person.fullName()
  if (providerType === 'locacao') return `${faker.company.name()} Locações`
  return faker.company.name()
}

function avatarFor(providerType: ProviderType): string {
  if (providerType !== 'pessoa') return '' // company/rental: UI renders initials + color
  const gender = faker.helpers.arrayElement(['men', 'women'])
  return `https://randomuser.me/api/portraits/${gender}/${faker.number.int({ min: 0, max: 99 })}.jpg`
}

function galleryFor(slug: string, label: string): MediaAsset[] {
  const count = faker.number.int({ min: 4, max: 8 })
  return Array.from({ length: count }, (_, i) => ({
    url: `https://picsum.photos/seed/${slug}-${i}/800/600`,
    width: 800,
    height: 600,
    alt: `${label} — foto ${i + 1}`,
  }))
}

function genReviews(): { reviews: Review[]; rating: number | null } {
  const count = faker.datatype.boolean(0.85) ? faker.number.int({ min: 1, max: 20 }) : 0
  const reviews: Review[] = Array.from({ length: count }, () => ({
    author: `${faker.person.firstName()} ${faker.person.lastName().charAt(0)}.`,
    rating: faker.number.int({ min: 3, max: 5 }),
    comment: faker.lorem.sentence(),
    date: faker.date.recent({ days: 365, refDate: REF_DATE }).toISOString().slice(0, 10),
    eventType: faker.helpers.arrayElement(['Show', 'Corporativo', 'Casamento', 'Igreja', 'Festival']),
  }))
  const rating = count
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
    : null
  return { reviews, rating }
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
    availableThisWeekend: faker.datatype.boolean(0.6),
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
  const tier = faker.helpers.weightedArrayElement(TIERS)
  const audienceMax = faker.number.int({ min: AUDIENCE[tier][0], max: AUDIENCE[tier][1] })
  const specs = genSpecs(category.slug, tier, audienceMax)
  const providerType = faker.helpers.weightedArrayElement([
    { weight: 50, value: 'empresa' as const },
    { weight: 35, value: 'locacao' as const },
    { weight: 15, value: 'pessoa' as const },
  ])
  const name = nameFor(providerType)

  let slug = slugify(name)
  let candidate = slug
  let n = 1
  while (usedSlugs.has(candidate)) candidate = `${slug}-${++n}`
  slug = candidate
  usedSlugs.add(slug)

  const priceModel = faker.helpers.weightedArrayElement([
    { weight: 60, value: 'por_diaria' as const },
    { weight: 30, value: 'por_evento' as const },
    { weight: 10, value: 'por_hora' as const },
  ])
  const priceFrom = priceFor(category.slug, tier)
  const { reviews, rating } = genReviews()

  professionals.push({
    id: `prof-${i + 1}`,
    slug,
    name,
    avatar: avatarFor(providerType),
    category: category.slug,
    providerType,
    specs,
    headline: headlineFor(category.slug, specs),
    bio: faker.lorem.sentence(),
    description: faker.lorem.paragraphs(2),
    location: {
      state: city.state,
      city: city.city,
      ibgeCode: city.ibgeCode,
      lat: city.lat,
      lng: city.lng,
    },
    priceFrom,
    priceModel,
    rating,
    reviewsCount: reviews.length,
    reviews,
    services: genServices(priceFrom, priceModel),
    gallery: galleryFor(slug, category.label),
    availability: genAvailability(),
    verified: faker.datatype.boolean(0.6),
    yearsExperience: faker.number.int({ min: 1, max: 25 }),
    completedJobs: faker.number.int({ min: 5, max: 800 }),
    responseTime: faker.helpers.arrayElement([
      'responde em ~1h',
      'responde em ~2h',
      'responde em ~4h',
      'responde no mesmo dia',
    ]),
  })
}

if (professionals.length < 500) {
  console.error(`Seed produced only ${professionals.length} (< 500). Aborting.`)
  process.exit(1)
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(professionals))
console.log(`✓ Wrote ${professionals.length} professionals to ${OUT}`)

// Core domain entity. Technically named `Professional` (kept for code/API/route
// `/profissional/[slug]`), conceptually a supplier of technical event structure.
// See docs/business-rules.md §1.

import type { CategorySlug } from './category'
import type { TechSpecs } from './specs'

export type ProviderType = 'pessoa' | 'empresa' | 'locacao'
export type PriceModel = 'por_diaria' | 'por_evento' | 'por_hora'

export interface Location {
  /** Two-letter state code (UF). */
  state: string
  city: string
  ibgeCode: string
  lat: number
  lng: number
}

export interface Service {
  name: string
  description: string
  priceFrom: number
  priceModel: PriceModel
}

export interface Review {
  author: string
  rating: number
  comment: string
  /** ISO date string. */
  date: string
  eventType?: string
}

export interface Availability {
  /** Weekdays served, 0 (Sunday) – 6 (Saturday). */
  weekdays: number[]
  /** ISO date string of the next free date. */
  nextAvailableDate: string
  availableThisWeekend: boolean
  /** ISO dates already booked, used to filter by a specific event date. */
  bookedDates: string[]
}

export interface MediaAsset {
  url: string
  width: number
  height: number
  alt: string
}

export interface Professional {
  id: string
  slug: string
  name: string
  /** Logo (empresa/locacao) or photo (pessoa). */
  avatar: string
  category: CategorySlug
  providerType: ProviderType
  specs: TechSpecs
  headline: string
  bio: string
  description: string
  location: Location
  priceFrom: number
  priceModel: PriceModel
  /** Average rating, or null when there are no reviews ("Novo"). */
  rating: number | null
  reviewsCount: number
  reviews: Review[]
  services: Service[]
  gallery: MediaAsset[]
  availability: Availability
  verified: boolean
  yearsExperience: number
  completedJobs: number
  responseTime: string
}

/** Lightweight projection sent to the catalog grid (card). */
export interface ProfessionalListItem {
  id: string
  slug: string
  name: string
  avatar: string
  category: CategorySlug
  providerType: ProviderType
  headline: string
  priceFrom: number
  priceModel: PriceModel
  rating: number | null
  reviewsCount: number
  city: string
  state: string
  /** Distance from the reference city, computed at request time when available. */
  distanceKm?: number
  verified: boolean
  /** 1–2 preformatted key specs shown on the card. */
  keySpecs: string[]
  /** First gallery image (card thumbnail). */
  thumbnail: MediaAsset
}

/** Full profile payload, with optional runtime distance. */
export interface ProfessionalDetail extends Professional {
  distanceKm?: number
}

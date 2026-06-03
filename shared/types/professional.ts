// Core domain entity: an event-service freelancer (or small team).
// See docs/business-rules.md.

import type { CategorySlug } from './category'
import type { SpecValue } from './specs'

export type ProviderType = 'pessoa' | 'equipe'
export type PriceModel = 'evento' | 'diaria' | 'hora'

export interface Location {
  /** Two-letter state code (UF). */
  state: string
  city: string
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
  nextAvailableDate: string
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
  /** Photo (pessoa) or empty for teams (UI renders initials + color). */
  avatar: string
  category: CategorySlug
  providerType: ProviderType
  /** 1–2 short highlights shown on the card. */
  keySpecs: string[]
  /** Facet values keyed by facet id (see CONTEXTUAL_FACETS). */
  specs: Record<string, SpecValue>
  headline: string
  bio: string
  description: string
  location: Location
  priceFrom: number
  priceModel: PriceModel
  rating: number | null
  reviewsCount: number
  reviews: Review[]
  services: Service[]
  gallery: MediaAsset[]
  availability: Availability
  verified: boolean
  /** Available on weekends. */
  weekend: boolean
  /** Brings own equipment/structure. */
  operator: boolean
  yearsExperience: number
  completedJobs: number
  responseTime: string
}

/** Lightweight projection for the catalog grid (card). */
export interface ProfessionalListItem {
  id: string
  slug: string
  name: string
  avatar: string
  category: CategorySlug
  providerType: ProviderType
  keySpecs: string[]
  priceFrom: number
  priceModel: PriceModel
  rating: number | null
  reviewsCount: number
  city: string
  state: string
  distanceKm?: number
  verified: boolean
  galleryCount: number
  thumbnail: MediaAsset
}

export interface ProfessionalDetail extends Professional {
  distanceKm?: number
}

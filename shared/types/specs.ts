// Technical specs per category — modeled as a DISCRIMINATED UNION keyed by `category`.
// These specs are the main faceted-search axis (see docs/business-rules.md §1, §2).
// Invariant: a Professional's `specs.category` always equals its `category`.

import type { CategorySlug } from './category'

/** Coarse audience/scale tier shared across categories where it applies. */
export type CapacityTier = 'pequeno' | 'medio' | 'grande' | 'open-air'

interface SpecsCommon {
  capacityTier?: CapacityTier
  audienceMax?: number
  brands?: string[]
  operatorIncluded?: boolean
}

export interface SonorizacaoSpecs extends SpecsCommon {
  category: 'sonorizacao'
  systemType: 'line-array' | 'ponto' | 'coluna'
  powerWRms: number
  consoleType: 'analogica' | 'digital'
  monitoring: 'wedge' | 'in-ear' | 'ambos'
  micChannels: number
}

export type LightFixture = 'moving-beam' | 'moving-wash' | 'moving-spot' | 'par-led' | 'strobo' | 'laser'

export interface IluminacaoSpecs extends SpecsCommon {
  category: 'iluminacao'
  fixtureTypes: LightFixture[]
  fixtureCount: number
  trussType: 'q30' | 'q50' | 'box'
  hazer: boolean
  pixelMappingCapable: boolean
}

export interface LedSpecs extends SpecsCommon {
  category: 'led'
  environment: 'indoor' | 'outdoor'
  /** Pixel pitch in millimeters (e.g., 1.5, 2.6, 3.9, 10). */
  pixelPitch: number
  areaM2: number
  brightnessNits: number
  format: 'parede' | 'totem' | 'piso' | 'criativo'
}

export interface ProjecaoSpecs extends SpecsCommon {
  category: 'projecao'
  /** Brightness in ANSI lumens. */
  projectorLumens: number
  projectorCount: number
  mappingCapable: boolean
  screenType: 'frontal' | 'retro' | 'superficie'
  screenSizeM: number
}

export interface PalcoSpecs extends SpecsCommon {
  category: 'palco'
  structureType: 'palco-modular' | 'trelica-grid' | 'ground-support' | 'praticavel'
  stageAreaM2: number
  roofIncluded: boolean
  maxLoadKg: number
}

export interface GeradorSpecs extends SpecsCommon {
  category: 'gerador'
  powerKva: number
  fuelType: 'diesel' | 'gasolina'
  silenced: boolean
  phases: 'mono' | 'trifasico'
  atsIncluded: boolean
}

export type TechSpecs =
  | SonorizacaoSpecs
  | IluminacaoSpecs
  | LedSpecs
  | ProjecaoSpecs
  | PalcoSpecs
  | GeradorSpecs

/** Maps a category slug to its concrete specs type. */
export type SpecsFor<C extends CategorySlug> = Extract<TechSpecs, { category: C }>

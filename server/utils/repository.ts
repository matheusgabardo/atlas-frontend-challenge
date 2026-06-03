// In-memory repository over the seeded dataset (committed JSON). Loaded once per server
// instance; no external calls at runtime (see docs/adr/0006).

import type { Professional } from '../../shared/types/professional'
import data from '../data/professionals.json'

const professionals = data as unknown as Professional[]
const bySlug = new Map(professionals.map((p) => [p.slug, p]))

export function getAllProfessionals(): Professional[] {
  return professionals
}

export function getProfessionalBySlug(slug: string): Professional | undefined {
  return bySlug.get(slug)
}

// GET /api/professionals/:slug — full provider profile. 404 for unknown slug.

import { haversineKm } from '../../../shared/catalog/distance'
import { CITY_BY_KEY } from '../../../shared/data/cities'
import type { ProfessionalDetail } from '../../../shared/types/professional'

export default defineEventHandler((event): ProfessionalDetail => {
  const slug = getRouterParam(event, 'slug')
  const professional = slug ? getProfessionalBySlug(slug) : undefined

  if (!professional) {
    throw createError({ statusCode: 404, message: 'Profissional não encontrado' })
  }

  const q = getQuery(event)
  const state = typeof q.state === 'string' ? q.state : undefined
  const city = typeof q.city === 'string' ? q.city : undefined
  const origin = state && city ? CITY_BY_KEY[`${state}:${city}`] : undefined
  const distanceKm = origin ? haversineKm(origin, professional.location) : undefined

  return { ...professional, distanceKm }
})

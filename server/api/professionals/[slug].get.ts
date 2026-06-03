// GET /api/professionals/:slug — full supplier profile. 404 for unknown slug.

import { haversineKm } from '../../../shared/catalog/distance'
import { CITY_BY_IBGE } from '../../../shared/data/cities'
import type { ProfessionalDetail } from '../../../shared/types/professional'

export default defineEventHandler((event): ProfessionalDetail => {
  const slug = getRouterParam(event, 'slug')
  const professional = slug ? getProfessionalBySlug(slug) : undefined

  if (!professional) {
    throw createError({ statusCode: 404, message: 'Fornecedor não encontrado' })
  }

  const refIbgeCode = getQuery(event).refIbgeCode
  const origin = typeof refIbgeCode === 'string' ? CITY_BY_IBGE[refIbgeCode] : undefined
  const target = CITY_BY_IBGE[professional.location.ibgeCode]
  const distanceKm = origin && target ? haversineKm(origin, target) : undefined

  return { ...professional, distanceKm }
})

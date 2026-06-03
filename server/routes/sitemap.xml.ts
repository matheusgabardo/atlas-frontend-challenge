import { getAllProfessionals } from '../utils/repository'
import { buildSitemap } from '../utils/sitemap'

// Served at /sitemap.xml — lists the catalog home + every professional profile.
export default defineEventHandler((event) => {
  const base = String(useRuntimeConfig(event).public.siteUrl || '')
  const xml = buildSitemap(
    base,
    getAllProfessionals().map((p) => p.slug),
  )
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return xml
})

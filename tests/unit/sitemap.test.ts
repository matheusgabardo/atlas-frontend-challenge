import { describe, expect, it } from 'vitest'
import { buildSitemap } from '../../server/utils/sitemap'

describe('buildSitemap', () => {
  it('lists the home page plus one entry per professional', () => {
    const xml = buildSitemap('https://quemfazeventos.com.br', ['joao-dj', 'maria-foto'])
    expect(xml).toContain('<loc>https://quemfazeventos.com.br/</loc>')
    expect(xml).toContain('<loc>https://quemfazeventos.com.br/profissional/joao-dj</loc>')
    expect(xml).toContain('<loc>https://quemfazeventos.com.br/profissional/maria-foto</loc>')
    expect((xml.match(/<url>/g) ?? []).length).toBe(3) // home + 2 profiles
  })

  it('is well-formed and trims a trailing slash from the base', () => {
    const xml = buildSitemap('https://quemfazeventos.com.br/', ['x'])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    expect(xml).not.toContain('.com.br//') // trailing slash on base must not double up
  })

  it('throws on a missing or relative base (loc must be absolute)', () => {
    expect(() => buildSitemap('', ['x'])).toThrow()
    expect(() => buildSitemap('/relative', ['x'])).toThrow()
  })
})

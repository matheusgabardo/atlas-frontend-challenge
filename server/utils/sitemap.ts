// Pure builder for the XML sitemap (tested in isolation). The route wires it to the
// repository + runtime siteUrl. No <lastmod>: the seeded dataset has no per-item
// update timestamp, and an invented date would mislead crawlers.
export function buildSitemap(base: string, slugs: string[]): string {
  const root = base.replace(/\/+$/, '')
  // <loc> must be an absolute URL (sitemaps.org 0.9). Fail loudly on a missing/relative
  // base instead of silently emitting a spec-invalid sitemap that crawlers reject.
  if (!/^https?:\/\//i.test(root)) {
    throw new Error(`buildSitemap: absolute siteUrl required, got "${base}"`)
  }
  const entry = (loc: string, priority: string) =>
    `  <url><loc>${loc}</loc><priority>${priority}</priority></url>`
  const urls = [
    entry(`${root}/`, '1.0'),
    ...slugs.map((s) => entry(`${root}/profissional/${encodeURIComponent(s)}`, '0.8')),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

// Coordinates the catalog ↔ profile round-trip (docs/adr/0010):
// - `slug`: which card was opened (set on click) → the catalog highlights it on return.
// - `pending`: set ONLY when the user returns via the profile "back" button, so the
//   catalog restores scroll/highlight then — not on a fresh logo/breadcrumb navigation.
// useState keeps both SSR-safe and shared across the (remounting) pages.
export function useCatalogReturn() {
  const slug = useState<string | null>('catalog:return-slug', () => null)
  const pending = useState<boolean>('catalog:return-pending', () => false)

  function remember(value: string) {
    slug.value = value
  }
  // Read-and-clear so each fires once per round-trip.
  function consume(): string | null {
    const value = slug.value
    slug.value = null
    return value
  }
  function requestReturn() {
    pending.value = true
  }
  function consumeReturn(): boolean {
    const value = pending.value
    pending.value = false
    return value
  }

  return { slug, remember, consume, requestReturn, consumeReturn }
}

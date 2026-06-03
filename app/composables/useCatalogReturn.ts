// Remembers which catalog card the user opened, so the listing can highlight it
// on return (see docs/adr/0010). `useState` keeps the value SSR-safe and shared
// between the card (writer) and the catalog page (reader).
export function useCatalogReturn() {
  const slug = useState<string | null>('catalog:return-slug', () => null)

  function remember(value: string) {
    slug.value = value
  }

  // Read and clear in one step so the highlight fires only once per return.
  function consume(): string | null {
    const value = slug.value
    slug.value = null
    return value
  }

  return { slug, remember, consume }
}

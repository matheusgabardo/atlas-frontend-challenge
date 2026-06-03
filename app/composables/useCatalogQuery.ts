// URL is the source of truth for the catalog state (docs/adr/0007). This composable reads
// `route.query` into a typed CatalogQuery and writes changes back via router.replace.

import { parseCatalogQuery, serializeCatalogQuery } from '~~/shared/catalog/queryParams'
import type { CatalogQuery } from '~~/shared/types'

export function useCatalogQuery() {
  const route = useRoute()
  const router = useRouter()

  const query = computed<CatalogQuery>(() => parseCatalogQuery(route.query))

  function update(patch: Partial<CatalogQuery>) {
    const next: CatalogQuery = { ...query.value, ...patch }
    router.replace({ query: serializeCatalogQuery(next) })
  }

  function reset() {
    router.replace({ query: {} })
  }

  return { query, update, reset }
}

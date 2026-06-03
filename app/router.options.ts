import type { RouterConfig } from '@nuxt/schema'
import { nextTick } from 'vue'

// Scroll restoration (docs/adr/0010).
// - Back/forward (popstate) → restore the exact previous offset. The catalog is
//   kept alive, so the full (paginated) list is still mounted and the saved
//   position lands precisely on the card that was opened. We wait a tick so the
//   kept-alive DOM is re-attached before the browser scrolls.
// - Same path (filter/sort changes via router.replace) → keep the offset; don't
//   jump to the top on every facet toggle.
// - New navigation → top (honouring in-page anchors).
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return new Promise((resolve) => {
        nextTick(() => resolve(savedPosition))
      })
    }
    if (to.path === from.path) return false
    if (to.hash) return { el: to.hash, top: 0 }
    return { top: 0 }
  },
}

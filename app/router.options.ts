import type { RouterConfig } from '@nuxt/schema'

// Scroll restoration (docs/adr/0010).
// - Same path (filter/sort change via router.replace) → don't move.
// - Catalog ('/') is NOT kept-alive: it remounts and restores its own scroll in onMounted
//   (after layout settles), but only on an explicit "back". So on a back/forward return we
//   return false (let the page do it without clamping); on a fresh push we go to the top.
// - Other routes: saved offset on back/forward, otherwise top (honouring in-page anchors).
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) return false
    if (to.path === '/') return savedPosition ? false : { top: 0 }
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 0 }
    return { top: 0 }
  },
}

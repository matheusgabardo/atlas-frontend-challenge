import type { RouterConfig } from '@nuxt/schema'

// Scroll restoration (docs/adr/0010).
// - The catalog ('/') is kept-alive and restores its OWN scroll in onActivated, after
//   layout settles. Router scrollBehavior fires too early for a kept-alive page (on a
//   microtask, before the re-attached DOM has its full height), so the offset would be
//   clamped — let the page handle it and return false here.
// - Other routes: restore the saved offset on back/forward, otherwise go to the top
//   (honouring in-page anchors).
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (to.path === '/') return false
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 0 }
    return { top: 0 }
  },
}

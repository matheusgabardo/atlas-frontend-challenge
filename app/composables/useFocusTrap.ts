// Focus management for modal dialogs (WCAG 2.4.3): focus moves into the dialog on open,
// Tab/Shift+Tab cycle within it, and focus returns to the trigger on close.
// With { inertBackground: true } the rest of the page is marked `inert` while open, so
// screen-reader virtual-cursor / swipe / rotor navigation can't escape the modal — the
// Tab trap alone doesn't constrain those (docs/adr/0010 review).
import type { Ref } from 'vue'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function useFocusTrap(
  isOpen: () => boolean,
  container: Ref<HTMLElement | undefined>,
  options: { inertBackground?: boolean } = {},
) {
  let lastFocused: HTMLElement | null = null
  let inerted: HTMLElement[] = []

  function focusables(): HTMLElement[] {
    if (!container.value) return []
    return Array.from(container.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
    )
  }

  // Mark everything outside the dialog inert. The dialog root is the nearest
  // [role="dialog"] (a direct child of the page root), so we inert its siblings.
  function setInert(on: boolean) {
    if (!options.inertBackground || !container.value) return
    if (on) {
      const modalRoot = container.value.closest<HTMLElement>('[role="dialog"]') ?? container.value
      const parent = modalRoot.parentElement
      if (!parent) return
      inerted = (Array.from(parent.children) as HTMLElement[]).filter(
        (el) => el !== modalRoot && !el.hasAttribute('inert'),
      )
      inerted.forEach((el) => el.setAttribute('inert', ''))
    } else {
      inerted.forEach((el) => el.removeAttribute('inert'))
      inerted = []
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (!isOpen() || e.key !== 'Tab') return
    const els = focusables()
    if (!els.length) return
    const first = els[0]!
    const last = els[els.length - 1]!
    const active = document.activeElement as HTMLElement
    if (e.shiftKey && (active === first || !container.value?.contains(active))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(isOpen, (open) => {
    if (!import.meta.client) return
    if (open) {
      lastFocused = document.activeElement as HTMLElement | null
      setInert(true)
      nextTick(() => focusables()[0]?.focus())
    } else {
      setInert(false)
      lastFocused?.focus?.()
      lastFocused = null
    }
  })

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    setInert(false) // never leave the page inert if the dialog unmounts while open
  })
}

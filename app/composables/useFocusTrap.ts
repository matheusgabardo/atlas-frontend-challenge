// Focus management for modal dialogs (WCAG 2.4.3): focus moves into the dialog on open,
// Tab/Shift+Tab cycle within it, and focus returns to the trigger on close.
import type { Ref } from 'vue'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function useFocusTrap(isOpen: () => boolean, container: Ref<HTMLElement | undefined>) {
  let lastFocused: HTMLElement | null = null

  function focusables(): HTMLElement[] {
    if (!container.value) return []
    return Array.from(container.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
    )
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
      nextTick(() => focusables()[0]?.focus())
    } else {
      lastFocused?.focus?.()
      lastFocused = null
    }
  })

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}

// Light/dark theme, persisted in localStorage and applied via data-theme on <html>.
// The pre-paint flash is avoided by an inline head script (see nuxt.config); this composable
// owns the runtime toggle and keeps state in sync after hydration.

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'qfe_theme'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  function apply(value: Theme) {
    if (import.meta.client) document.documentElement.setAttribute('data-theme', value)
  }

  function set(value: Theme) {
    theme.value = value
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, value)
    apply(value)
  }

  function toggle() {
    set(theme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'light'
    theme.value = stored
    apply(stored)
  })

  return { theme, set, toggle }
}

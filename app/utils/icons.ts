// Line-icon `d` paths (2px stroke), reused across the UI. Multi-subpath strings are split
// on " M" by <AppIcon>.

export const ICONS = {
  search: 'M21 21l-4.3-4.3 M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z',
  pin: 'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  chev: 'M6 9l6 6 6-6',
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  star: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.8 6.7 19.4l1.2-6L3.4 9.3l6-.7L12 3z',
  verified: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z M9 12l2 2 4-4',
  image: 'M3 5h18v14H3V5z M3 16l5-5 4 4 3-3 6 6',
  x: 'M6 6l12 12 M18 6L6 18',
  filter: 'M3 5h18 M6 12h12 M10 19h4',
  arrowL: 'M15 6l-6 6 6 6',
  arrowR: 'M9 6l6 6-6 6',
  empty: 'M5 8h14v11H5z M9 12h6',
  back: 'M15 6l-6 6 6 6',
  clock: 'M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  calendar: 'M4 6h16v15H4z M4 10h16 M8 3v4 M16 3v4',
  box: 'M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7 M12 11v10',
  check: 'M5 12l4.5 4.5L19 7',
} as const

export type IconName = keyof typeof ICONS

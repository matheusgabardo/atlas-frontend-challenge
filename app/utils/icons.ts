// Line-icon `d` paths (2px stroke), reused across the UI. Multi-subpath strings are split
// on " M" by <AppIcon>.

export const ICONS = {
  search: 'M21 21l-4.3-4.3 M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z',
  pin: 'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  chev: 'M6 9l6 6 6-6',
  heart: 'M12 20s-7-4.4-9.3-8.2C1 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.5 0 5 3.5 3.3 6.8C19 15.6 12 20 12 20z',
  star: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.8 6.7 19.4l1.2-6L3.4 9.3l6-.7L12 3z',
  verified: 'M9 12l2 2 4-4 M12 3l2.1 1.5 2.6-.2 1 2.4 2.2 1.4-.7 2.5.7 2.5-2.2 1.4-1 2.4-2.6-.2L12 21l-2.1-1.5-2.6.2-1-2.4-2.2-1.4.7-2.5-.7-2.5 2.2-1.4 1-2.4 2.6.2L12 3z',
  image: 'M3 5h18v14H3V5z M3 16l5-5 4 4 3-3 6 6',
  x: 'M6 6l12 12 M18 6L6 18',
  filter: 'M3 5h18 M6 12h12 M10 19h4',
  arrowL: 'M15 6l-6 6 6 6',
  arrowR: 'M9 6l6 6-6 6',
  empty: 'M5 8h14v11H5z M9 12h6',
  back: 'M15 6l-6 6 6 6',
} as const

export type IconName = keyof typeof ICONS

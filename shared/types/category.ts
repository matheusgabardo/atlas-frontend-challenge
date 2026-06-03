// Freelancer marketplace taxonomy (per the Claude Design handoff): event service categories.
// See docs/business-rules.md.

export const CATEGORY_SLUGS = [
  'dj',
  'som',
  'luz',
  'foto',
  'bar',
  'recepcao',
  'seguranca',
  'cerimonial',
  'valet',
] as const
export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

export interface Category {
  slug: CategorySlug
  label: string
  /** Multi-subpath SVG `d` (split on " M" when rendering). */
  icon: string
}

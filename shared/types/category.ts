// Technical AV niche taxonomy (v3): 6 categories in 3 groups.
// See docs/business-rules.md §1.

export const CATEGORY_GROUPS = ['som-luz', 'imagem', 'estrutura-energia'] as const
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number]

export const CATEGORY_SLUGS = [
  'sonorizacao',
  'iluminacao',
  'led',
  'projecao',
  'palco',
  'gerador',
] as const
export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

export interface Category {
  slug: CategorySlug
  label: string
  group: CategoryGroup
  /** Icon identifier (resolved by the UI layer). */
  icon: string
}

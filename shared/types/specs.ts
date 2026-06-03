// Contextual facet definitions per category — the faceted-search differential.
// `multi` = enum (one of options, multi-select OR); `bool` = boolean flag.

export type FacetType = 'multi' | 'bool'

export interface FacetDef {
  id: string
  label: string
  type: FacetType
  options: string[]
}

/** A provider's spec value: an enum string or a boolean flag. */
export type SpecValue = string | boolean

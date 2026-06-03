// Category metadata + contextual-facet configuration (single source of truth for the
// faceted search). Ported from the Claude Design handoff. See docs/business-rules.md.

import type { Category, CategorySlug } from '../types/category'
import type { FacetDef } from '../types/specs'
import type { ProviderType } from '../types/professional'

export const PROVIDER_TYPES: Record<ProviderType, string> = {
  pessoa: 'Freelancer',
  equipe: 'Equipe',
}

export const CATEGORIES: Category[] = [
  { slug: 'dj', label: 'DJ', icon: 'M4 13v-1a8 8 0 0 1 16 0v1 M4 13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2 M20 13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2' },
  { slug: 'som', label: 'Sonorização', icon: 'M4 9v6h4l5 4V5L8 9H4z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12' },
  { slug: 'luz', label: 'Iluminação', icon: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.8 10.6c.5.4.8 1 .8 1.6v.8h6v-.8c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z' },
  { slug: 'foto', label: 'Fotografia', icon: 'M4 8h3l2-2h6l2 2h3v11H4z M12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z' },
  { slug: 'bar', label: 'Garçom & Bar', icon: 'M5 4h14l-7 8-7-8z M12 12v7 M8 20h8' },
  { slug: 'recepcao', label: 'Recepção', icon: 'M8 5h8v2H8z M8 6H6v15h12V6h-2 M9 11h6 M9 15h6' },
  { slug: 'seguranca', label: 'Segurança', icon: 'M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z M9 12l2 2 4-4' },
  { slug: 'cerimonial', label: 'Cerimonial', icon: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M6 11a6 6 0 0 0 12 0 M12 17v4 M9 21h6' },
  { slug: 'valet', label: 'Valet', icon: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11 M4 11h16v5H4z M7 16v2 M17 16v2 M7.5 13.5h.5 M16 13.5h.5' },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>

export const CATEGORY_LABEL = (slug: string): string => CATEGORY_BY_SLUG[slug as CategorySlug]?.label ?? slug

export const CONTEXTUAL_FACETS: Record<CategorySlug, FacetDef[]> = {
  dj: [
    { id: 'estilo', label: 'Estilo', type: 'multi', options: ['Open format', 'House', 'Eletrônica', 'Sertanejo', 'Pop / Flashback'] },
    { id: 'estrutura', label: 'Estrutura', type: 'bool', options: ['Leva estrutura'] },
  ],
  som: [
    { id: 'arranjo', label: 'Arranjo', type: 'multi', options: ['Line array', 'Ponto', 'Coluna'] },
    { id: 'console', label: 'Console', type: 'multi', options: ['Digital', 'Analógico'] },
  ],
  luz: [
    { id: 'fixture', label: 'Tipo de fixture', type: 'multi', options: ['Moving head', 'Par LED', 'Beam', 'Wash'] },
    { id: 'mesa', label: 'Mesa / console', type: 'multi', options: ['GrandMA', 'Avolites', 'Chamsys'] },
  ],
  foto: [
    { id: 'ftipo', label: 'Tipo', type: 'multi', options: ['Fotografia', 'Filmagem', 'Foto + Vídeo', 'Drone'] },
    { id: 'fentrega', label: 'Prazo de entrega', type: 'multi', options: ['até 7 dias', '15 dias', '30 dias'] },
  ],
  bar: [
    { id: 'bservico', label: 'Serviço', type: 'multi', options: ['Garçom', 'Bartender', 'Copeira', 'Equipe completa'] },
    { id: 'bestrutura', label: 'Estrutura', type: 'bool', options: ['Leva bar / estrutura'] },
  ],
  recepcao: [
    { id: 'rservico', label: 'Serviço', type: 'multi', options: ['Recepcionista', 'Hostess', 'Check-in / credenciamento'] },
    { id: 'rbilingue', label: 'Idiomas', type: 'bool', options: ['Bilíngue'] },
  ],
  seguranca: [
    { id: 'stipo', label: 'Tipo', type: 'multi', options: ['Desarmado', 'Armado', 'Portaria', 'Supervisor'] },
    { id: 'sequipe', label: 'Nº de seguranças', type: 'multi', options: ['até 2', '3 a 5', '6+'] },
  ],
  cerimonial: [
    { id: 'ctipo', label: 'Atuação', type: 'multi', options: ['Cerimonialista', 'Mestre de cerimônias', 'Assessoria completa'] },
    { id: 'csegmento', label: 'Segmento', type: 'multi', options: ['Casamento', 'Corporativo', 'Social'] },
  ],
  valet: [
    { id: 'equipe', label: 'Nº de manobristas', type: 'multi', options: ['até 2', '3 a 5', '6+'] },
    { id: 'seguro', label: 'Seguro', type: 'bool', options: ['Seguro incluso'] },
  ],
}

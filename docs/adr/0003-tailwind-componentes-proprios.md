# ADR-003 — Tailwind v4 + componentes próprios + lógica em composables

**Status:** Aceito · 2026-06

**Contexto:** Vaga sênior valoriza design system e componentização; busca-se controle visual e bundle enxuto, sem peso de biblioteca de UI.

**Decisão:** Tailwind v4 (tokens via `@theme`) + componentes headless próprios (sem lib de UI) + lógica abstraída em composables.

**Consequências:**
- ➕ Autoria do design system, reuso, bundle menor, separação apresentação/lógica.
- ➖ A acessibilidade é toda nossa (ver [ADR-002](./0002-lightbox-fotos.md)); mais código base para manter.
- **SCSS/SASS:** Tailwind v4 usa `@theme`/CSS nativo, não há `.scss` real. Tratado como experiência documentada no README (ou bloco pontual justificado), para não alegar competência sem evidência.

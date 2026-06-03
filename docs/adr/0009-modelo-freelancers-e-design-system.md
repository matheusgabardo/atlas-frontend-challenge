# ADR-009 — Modelo de domínio: freelancers de eventos + adoção do design-system do Claude Design

**Status:** Aceito · 2026-06-03

**Contexto:** O protótipo entregue pelo **Claude Design** (HTML/CSS/JS) modela o produto como **marketplace de freelancers de eventos** (9 categorias de serviço: DJ, som, luz, foto, garçom/bar, recepção, segurança, cerimonial, valet; tipo Freelancer/Equipe; facetas como estilo/arranjo/fixture). Isso difere de um experimento anterior (v3) que estreitava para estrutura técnica AV (som/luz/LED/palco/gerador) com `TechSpecs` como discriminated union. O design também chegou com um sistema de **tokens/CSS completo** (azul, Sora/Inter, claro/escuro).

**Decisão:**
1. **Domínio = freelancers** (seguir o design). Re-modelou-se `shared/types` (9 categorias, `specs` flat + `CONTEXTUAL_FACETS`, `providerType` pessoa/equipe), re-gerou-se o seed (540) e atualizaram-se os testes. O **motor `applyQuery`, a API Nitro e o repositório foram preservados** (são genéricos sobre categorias/specs/filtros).
2. **Adotar o design-system do protótipo**: portaram-se `tokens.css` + os CSS dos componentes (`catalog`/`profile`/`overlays`) como camada de estilo, e **reconstruíram-se as telas em Vue/Nuxt** (componentização + lógica reativa + SSR + nossa API) — em vez de copiar o JS client-side do protótipo. O Tailwind permanece para utilitários; os tokens da marca espelham o `tokens.css`.

**Consequências:**
- ➕ Fidelidade pixel-a-pixel ao design entregue, com SSR/SEO/estado-na-URL/testes que o protótipo não tinha.
- ➕ Reuso do motor de busca já testado — o pivô custou tipos + seed, não a arquitetura.
- ➖ ADR-003 (Tailwind + componentes próprios) é parcialmente substituído: a estilização principal vem do CSS portado; o Tailwind fica para utilitários. Documentado aqui.
- O repertório técnico AV (v3) e o generalista ficam como histórico em `docs/business-rules.md` §7 e `dados_privados/`.

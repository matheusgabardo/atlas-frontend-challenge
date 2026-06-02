# ADR-001 — Perfil em página dedicada (SSR) vs modal-com-URL

**Status:** Aceito · 2026-06

**Contexto:** O perfil precisa ser indexável, compartilhável e rápido. Concorrentes do ramo usam perfil em modal-com-URL.

**Decisão:** Página dedicada renderizada no servidor: `/profissional/[slug]`.

**Consequências:**
- ➕ SEO real (HTML completo, meta/OG, JSON-LD), LCP previsível, URL canônica, acessibilidade simples.
- ➖ A navegação sai da listagem — mitigado pelo lightbox de fotos ([ADR-002](./0002-lightbox-fotos.md)).
- **Modal-com-URL rejeitado:** mesmo com URL, exige 2 trilhas de render (modal + fallback), conteúdo costuma carregar client-side (LCP/indexação piores), listagem fica montada atrás (memória/CLS) e foco/back-button ficam frágeis. URL no modal resolve só o compartilhamento.

# ADR-007 — Estado: URL como fonte de verdade + Pinia só como cache

**Status:** Aceito · 2026-06

**Contexto:** Filtros/ordenação/página precisam ser compartilháveis (URL) e o SSR não pode divergir do client. "URL fonte de verdade" + "store que cacheia páginas" podem virar duas fontes mutáveis e gerar loops/mismatch/duplo fetch.

**Decisão:** Fluxo **unidirecional**: `route.query` é a **única** fonte de filtros/ordenação/página (lido por um composable read-only `useCatalogQuery`; mutação só via `router.replace`). O **Pinia guarda só** resultados (cache keyed pela querystring normalizada), `loading` e cursor do infinite scroll — **nunca** filtros. `useAsyncData` com key determinística reaproveita o payload SSR na hidratação (sem refetch).

**Consequências:**
- ➕ Sem dupla fonte de verdade, sem refetch/mismatch, estado compartilhável e SSR-coerente.
- ➖ Exige disciplina no fluxo unidirecional. Justificativa do Pinia: cache cross-componente (listagem ↔ `/favoritos`) e devtools — não "por causa da vaga".

# ADR-004 — Busca/filtros/ordenação no servidor (Nitro) + função pura `applyQuery`

**Status:** Aceito · 2026-06

**Contexto:** ≥500 itens; precisa de SSR da 1ª dobra já filtrada, payload pequeno, escalável e testável. Também demonstra "consumo de APIs".

**Decisão:** A aplicação consome endpoints **Nitro** (`/api/professionals`, `/api/professionals/[slug]`, `/api/facets`). A lógica de filtro/ordenação/paginação é extraída numa **função pura** (`shared/catalog/applyQuery.ts`), reutilizada pelos handlers e testável fora do Nitro.

**Consequências:**
- ➕ SSR real, payload enxuto, escalabilidade, e o maior ROI de teste (função pura).
- ➖ Exige definir o contrato (DTOs card vs perfil, envelope de paginação, erros 404/400) antes da UI.

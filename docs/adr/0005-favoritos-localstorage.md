# ADR-005 — Favoritos em localStorage (client-only)

**Status:** Aceito · 2026-06

**Contexto:** A empresa salva profissionais de interesse; queremos persistir sem backend.

**Decisão:** Favoritos são estado **client-only** (store/composable separado do catálogo), persistidos em `localStorage`. O coração é renderizado só após a hidratação; sincronização entre abas via evento `storage`.

**Consequências:**
- ➕ Persistência de estado (item opcional do challenge) sem backend; habilita a tela `/favoritos` e orçamento em lote.
- ➖ Risco de hydration mismatch (mitigado renderizando pós-mount). Store de favoritos desacoplada do cache do catálogo ([ADR-007](./0007-estado-url-pinia.md)).

# ADR-002 — Lightbox de fotos (quick view) na listagem

**Status:** Aceito · 2026-06

**Contexto:** A empresa quer ver o portfólio do profissional rapidamente, sem precisar navegar para outra página.

**Decisão:** Visualização rápida de fotos (lightbox) acionável a partir do card. A navegação por rota ([ADR-001](./0001-perfil-pagina-dedicada.md)) continua sendo a principal (performance/SEO).

**Consequências:**
- ➕ Menos cliques para "dar uma olhada"; mantém o contexto da busca (scroll/filtros).
- ➖ Mais um componente com responsabilidade de acessibilidade (focus trap, ESC, navegação por teclado).
- Não substitui o perfil completo; é um atalho focado em mídia.

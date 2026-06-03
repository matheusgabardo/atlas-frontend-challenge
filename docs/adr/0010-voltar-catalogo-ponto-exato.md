# ADR-010 — Voltar do perfil restaura o catálogo no ponto exato

**Status:** Aceito · 2026-06

**Contexto:** No catálogo, os resultados são paginados com "carregar mais" — os itens vão se **acumulando** num estado local da página (`items`/`page`). Ao abrir um perfil (`/profissional/[slug]`) e voltar, a página do catálogo era recriada do zero: voltava à **página 1** (perdendo os itens extras já carregados) e ao **topo**. Resultado: o card que o usuário clicou podia nem existir mais no DOM, e a posição de scroll se perdia — fricção alta numa lista de 500+ profissionais. (Bug correlato: trocar um filtro, que usa `router.replace` no mesmo path, também pulava pro topo.)

**Decisão:**

1. **`keepalive` na página do catálogo** — `definePageMeta({ keepalive: true })`. A instância é mantida em memória ao navegar para o perfil; ao voltar, os itens (todas as páginas) e o DOM continuam montados, **sem refetch**.
2. **`scrollBehavior` explícito** (`app/router.options.ts`): em `popstate` (voltar/avançar) restaura a `savedPosition` exata (após um `nextTick`, para o DOM keep-alive já estar reanexado); em troca de filtro/ordenação (mesmo path) **não** rola pro topo; navegação nova vai ao topo (respeitando âncoras). Como a lista segue montada, a posição salva cai exatamente sobre o card aberto.
3. **Voltar inteligente** no perfil (`catalogBackTarget`): se o usuário veio do catálogo (`history.state.back` é `/` ou `/?…`), `router.back()` restaura scroll/estado; senão (link direto, outra origem), `navigateTo('/')`.
4. **Realce do card** ao retornar — `useState` guarda o slug clicado (escrito no clique do card, lido no `onActivated`); ~1.8s de `outline`, respeitando `prefers-reduced-motion`. Orienta o olho para "o item que você abriu".

> **Armadilha (pega na revisão multi-perspectiva):** `keepalive` **sozinho não bastava**. O `useAsyncData` observava `baseParams` — um objeto recriado a cada recálculo (`serializeCatalogQuery` retorna um literal novo) — **por referência**. Ao voltar (popstate) a query recomputava → nova referência → o watch disparava → refetch da página 1 → `watch(data)` resetava `items`/`page`, derrubando as páginas do "carregar mais" e jogando o scroll além do fim da lista. Correção: observar uma **chave string estável** (`JSON.stringify(baseParams)`), que só muda numa query real — coberto por teste de regressão em `tests/unit/queryParams.test.ts`.

**Consequências:**

- ➕ Retorno instantâneo e no ponto exato; zero refetch; corrige de quebra o "pulo pro topo" ao filtrar.
- ➕ Distinção clara de intenção: a logo/breadcrumb levam ao catálogo "limpo"; o botão _Voltar à busca_ devolve ao estado anterior.
- ➖ O catálogo ocupa memória enquanto um perfil está aberto (1 página — irrelevante). `keepalive` exige cuidado para não servir estado obsoleto; aqui o estado deriva da URL ([ADR-007](0007-estado-url-pinia.md)) + store global de favoritos, então segue coerente.
- _Alternativa descartada:_ persistir `page`+`scrollY` em `sessionStorage` e **reidratar** no mount — refaz N fetches, mais código e risco de mismatch de altura. `keepalive` preserva o estado real sem custo de rede.

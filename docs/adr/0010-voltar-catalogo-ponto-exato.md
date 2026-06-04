# ADR-010 — Voltar do perfil restaura o catálogo no ponto exato

**Status:** Aceito · 2026-06

**Contexto:** No catálogo, os resultados são paginados com "carregar mais" — os itens vão se **acumulando** num estado local da página (`items`/`page`). Ao abrir um perfil (`/profissional/[slug]`) e voltar, a página do catálogo era recriada do zero: voltava à **página 1** (perdendo os itens extras já carregados) e ao **topo**. Resultado: o card que o usuário clicou podia nem existir mais no DOM, e a posição de scroll se perdia — fricção alta numa lista de 500+ profissionais. (Bug correlato: trocar um filtro, que usa `router.replace` no mesmo path, também pulava pro topo.)

**Decisão:**

1. **Estado da lista em `useState`** (não em `keepalive`). `items`/`page`/`appliedKey` ficam em estado de app (`useState`), que **sobrevive à remontagem** da página. Ao voltar do perfil a página remonta, mas a lista (todas as páginas do "carregar mais") continua lá → o documento volta **alto o suficiente** para o scroll cair no ponto certo. O `watch(data)` só adota a página 1 quando a query muda de fato (`appliedKey !== baseKey`); num retorno com a mesma query, **mantém** a lista acumulada. _(Por que não `keepalive`: provou-se não confiável em preservar a página neste setup — ela remontava mesmo assim, e o scroll/itens se perdiam. `useState` torna a remontagem o caminho explícito e determinístico.)_
2. **A página restaura o próprio scroll, após o layout.** Um listener passivo guarda o `scrollY` corrente; em `onBeforeUnmount` ele é salvo (marcado pela chave da query) e em `onMounted` reaplicado **depois do paint** (dois `requestAnimationFrame`) — mas **só num "voltar" explícito** (flag em `useState` setado pelo botão _Voltar à busca_), nunca numa navegação nova (logo/breadcrumb). O `scrollBehavior` (`app/router.options.ts`): mesmo path não rola; `/` no back delega à página (`false`), no push novo vai ao topo. _Por que não só o `scrollBehavior`:_ ele dispara cedo demais (microtask, antes do DOM remontado ter altura) → offset **clampado**. Restaurar após o paint resolve.
3. **Voltar inteligente** no perfil (`catalogBackTarget`): se veio de uma listagem (`history.state.back` é `/`, `/?…` ou `/favoritos`), `router.back()`; senão (link direto/outra origem), `navigateTo('/')`. Em ambos sinaliza o "voltar" (passo 2).
4. **Realce do card** ao retornar — `useState` guarda o slug clicado (escrito no clique do card, lido no `onMounted` sob o mesmo flag de retorno); ~1.8s de `outline`, respeitando `prefers-reduced-motion`.

> **Armadilha (pega na revisão multi-perspectiva):** observar `baseParams` no `useAsyncData` **por referência** refazia fetch a cada recálculo (`serializeCatalogQuery` retorna um literal novo), resetando a lista. Correção: observar uma **chave string estável** (`JSON.stringify(baseParams)`), que só muda numa query real — coberta por teste em `tests/unit/queryParams.test.ts`. (Foi a tentativa de `keepalive` que escondeu esse e outros problemas de timing; daí a virada para `useState` + remontagem determinística.)

**Consequências:**

- ➕ Retorno no ponto exato; corrige de quebra o "pulo pro topo" ao filtrar. Distinção de intenção: logo/breadcrumb → catálogo "limpo" (topo); _Voltar à busca_ → estado anterior.
- ➖ Sem `keepalive` a página **remonta** ao voltar (re-render da lista + um refetch da página 1 que a guarda **ignora**). Custo de render aceitável; em troca, comportamento **determinístico** (hooks sempre disparam) e estado robusto via `useState`, derivado da URL ([ADR-007](0007-estado-url-pinia.md)).
- _Alternativa considerada:_ a solução final é próxima de "persistir estado + reidratar no mount" — mas sem refazer N fetches (só a página 1, ignorada) e sem mismatch de altura, porque a lista inteira vem do `useState`.

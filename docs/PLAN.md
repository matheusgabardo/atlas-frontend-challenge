# Planejamento Global — Catálogo de Fornecedores de Estrutura Técnica para Eventos

> Documento vivo. Consolida objetivo, princípios, fluxo de trabalho, roadmap, arquitetura e o mapeamento dos requisitos da vaga ao teste. Outros documentos relacionados: [`business-rules.md`](./business-rules.md), [`dev-journal.md`](./dev-journal.md), [`AI_USAGE.md`](./AI_USAGE.md), `adr/` (decisões).

## 1. Objetivo
App **Nuxt 4 + Vue 3 + TypeScript** — catálogo/listagem de **freelancers de eventos** (DJ, som, luz, foto, garçom/bar, recepção, segurança, cerimonial, valet; ≥ 500), com busca, **busca facetada** (facetas contextuais por categoria), ordenação, carregamento sob demanda e perfil detalhado. Modelo alinhado ao protótipo do **Claude Design** (ver [ADR-009](./adr/0009-modelo-freelancers-e-design-system.md)). Foco da avaliação: organização, componentização, decisões técnicas, performance/Core Web Vitals e UX. Detalhes em [`business-rules.md`](./business-rules.md).

## 2. Princípios
1. **O challenge tem prioridade absoluta.** Diferenciais da vaga só entram quando não comprometem o escopo mínimo nem a qualidade.
2. **Com calma e com domínio.** Planejar antes de codar; entender cada peça (especialmente Docker) para defender na entrevista.
3. **Documentar o porquê.** Toda decisão relevante vira ADR + reflexo no README.
4. **Autoria/essência.** A solução é dirigida pelo Matheus (background real em áudio/eventos). A IA é ferramenta; as decisões são dele. Registrado em [`dev-journal.md`](./dev-journal.md) e [`AI_USAGE.md`](./AI_USAGE.md).

## 3. Fluxo de trabalho
```
Regras de negócio  →  Telas / Arquitetura de Informação  →  Figma (alta fidelidade)
        →  Implementação (dados+API → listagem → perfil → lightbox)
        →  Performance/A11y/Testes  →  Docker + Deploy  →  Docs + Vídeo
```
Observação: **Dados + API Nitro** podem ser construídos em paralelo ao Figma (dependem do domínio, não do visual). A **UI** só começa com os layouts definidos.

## 4. Roadmap por fases e prioridade
Legenda: **P0** = exigido pelo challenge · **P1** = diferencial da vaga (baixo custo, alto sinal) · **P2** = diferencial opcional.

| # | Fase | Prioridade |
|---|---|---|
| 0 | Scaffold Nuxt 4 + stack | P0 ✅ |
| 1 | Regras de negócio + modelo de domínio | P0 |
| 2 | Telas / IA / inventário de componentes (input Figma) | P0 |
| 3 | Config base (Tailwind tokens, módulos, TS strict, lint, Pinia?) | P0 |
| 4 | Dados reais (seed via API pública) + tipos + Nitro API | P0 |
| 5 | Listagem (busca/filtros/ordenação/URL/infinite scroll/estados) | P0 |
| 6 | Perfil SSR + meta/OG/JSON-LD | P0 |
| 7 | Lightbox de fotos (quick view) | P0 (melhoria proposta) |
| 8 | Performance, A11y + observabilidade Web Vitals | P0/P1 |
| 9 | Testes (Vitest unit + component) | P0/P1 |
| 10 | Storybook / Design System | P1 |
| 11 | CI GitHub Actions (lint/test/build) | P1 ✅ (workflow pronto; secrets pendentes) |
| 12 | Docker + deploy no servidor (ssh mgmdev) + Nginx + TLS Cloudflare | P1 ✅ **no ar: quemfazeventos.com.br** |
| 13 | README + ADRs + AI_USAGE + roteiro do vídeo | P0 |

## 5. Arquitetura técnica
- **Camada de dados:** JSON gerado por script (seed determinística + dados de APIs públicas cacheados) → servido por **Nitro server routes** (`/api/professionals`, `/api/professionals/[slug]`, `/api/facets`). Filtro/ordenação/paginação **no servidor**. O front consome essa API (demonstra "consumo de APIs").
- **Estado:** URL como **fonte de verdade** dos filtros (compartilhável/SSR); store **Pinia** guarda **só** cache de resultados, loading e cursor — nunca filtros (fluxo unidirecional, [ADR-007](./adr/0007-estado-url-pinia.md)).
- **Modelo:** entidade `Professional` (freelancer/equipe, `providerType`) com **`specs` + facetas contextuais por categoria** (`CONTEXTUAL_FACETS`) → **busca facetada**, o principal diferencial de modelagem/UX.
- **Componentização:** `components/ui` (base/design system), `components/catalog`, `components/professional`, `components/layout`. Lógica em **composables** (`useProfessionals`, `useCatalogQuery`, `useInfiniteScroll`, `useLightbox`). Tipos em `shared/types`.
- **Estilo:** Tailwind v4 + design tokens (`@theme`) + componentes próprios (sem lib de UI).

## 6. Requisitos da vaga → como exemplificamos no teste
> Sempre subordinado ao challenge. "Construir" = implementado no código; "Documentar" = citado no README/entrevista (sem desviar escopo).

| Requisito / diferencial | Como | Modo |
|---|---|---|
| Vue 3 + Nuxt + TS | Base do projeto | Construir |
| Vue 2 | Experiência prévia | Documentar |
| Pinia/Vuex | Store do catálogo (Pinia) | Construir |
| HTML5/CSS3/JS sólidos | App inteira | Construir |
| TailwindCSS | Estilização | Construir |
| SCSS/SASS | Tokens/exceções pontuais + experiência | Construir leve + Documentar |
| Consumo de APIs | Nitro API + seed via APIs públicas | Construir |
| Mobile First / responsivo | Layout mobile-first | Construir |
| Performance web + SEO técnico | SSR, @nuxt/image, CWV, meta/OG/JSON-LD | Construir |
| Ciclo build/deploy/manutenção | Docker + CI + deploy no servidor | Construir |
| Git + versionamento | **Conventional Commits**, branches, PRs | Construir |
| Metodologia ágil | Roadmap em fases + board de tarefas | Documentar |
| Design System + Storybook | Componentes próprios + Storybook | Construir (P1) |
| Core Web Vitals + observabilidade | Métricas Web Vitals → endpoint | Construir (P1) |
| Testes automatizados | Vitest (compatível Jest) | Construir |
| CSS escalável (BEM) | ADR utility-first vs BEM + BEM onde houver CSS custom | Documentar + leve |
| Docker no dev | devcontainer/compose de dev | Construir (P1) |
| Ferramentas de IA + eng. de prompts | [`AI_USAGE.md`](./AI_USAGE.md) | Documentar |
| Orientar time sobre IA | Guidelines em AI_USAGE | Documentar |
| React/Angular, PHP/Laravel | Experiência prévia | Documentar |

## 7. Dados & imagens
Dados gerados em **build-time** e cacheados em JSON commitado (runtime rápido, sem chave, reprodutível pelo avaliador — [ADR-006](./adr/0006-dados-build-time.md)). Fontes: **Faker pt-BR** (nomes de fornecedores, bios, preços, reviews, disponibilidade e **specs técnicas** realistas) como primária; **randomuser.me** (avatar de fornecedores `pessoa`); **Pexels** (galeria por categoria, chave só no build); **IBGE + dataset de municípios** (estados/cidades/coordenadas). Logos de empresa = iniciais+cor. Detalhes em [`business-rules.md`](./business-rules.md).

## 8. Performance, A11y & observabilidade
SSR da 1ª dobra filtrada; `@nuxt/image` (lazy/srcset/dimensões → CLS≈0); `content-visibility:auto` nos cards; prefetch do perfil; code-split por rota. A11y: teclado/foco no lightbox, ARIA, contraste AA, `prefers-reduced-motion`. Observabilidade: coleta de LCP/CLS/INP enviada a um endpoint (P1).

## 9. Documentação, autoria & IA
- **ADRs** em [`docs/adr/`](./adr/): 001 (perfil SSR vs modal-com-URL) · 002 (lightbox) · 003 (Tailwind + componentes próprios) · 004 (busca no servidor + applyQuery puro) · 005 (favoritos em localStorage) · 006 (dados em build-time) · 007 (estado URL + Pinia). Novos conforme surgirem.
- **[`dev-journal.md`](./dev-journal.md):** registro contínuo da jornada e da essência/autoria do Matheus.
- **[`AI_USAGE.md`](./AI_USAGE.md):** ferramentas, como foram usadas, engenharia de prompts e revisão crítica (requisito do challenge).

## 10. Limites de escopo (o que NÃO faremos)
Sem backend real/banco de dados; sem autenticação; sem PHP/Laravel; sem app Vue 2/React/Angular paralelos. Esses pontos entram como **experiência documentada**, não como código — para não desviar do challenge.

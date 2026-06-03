# QuemFaz Eventos

Marketplace **B2B** que conecta organizadores (produtoras, casas de festa, empresas) aos **freelancers que fazem o evento acontecer** — DJ, sonorização, iluminação, fotografia, garçom & bar, recepção, segurança, cerimonial e valet. Busca por cidade, **busca facetada** por especialidade, perfis detalhados e solicitação de orçamento.

> Desafio técnico Front-end — Atlas. Stack pedida: **Vue 3 + Nuxt + TypeScript**.

## Entrega

- **Solução publicada:** https://quemfazeventos.com.br
- **Repositório:** este repositório
- **Vídeo (≤ 5 min):** _[adicionar link]_

## Stack

- **Nuxt 4** (Vue 3, **SSR**) · **TypeScript** strict
- **Nitro** server routes como API (filtro/ordenação/paginação no servidor)
- **Tailwind v4** + **design-system próprio** (tokens, claro/escuro) — sem lib de UI
- **Pinia** (favoritos) · **@nuxt/image**
- **Vitest** (unidade) · **ESLint + Prettier** · **Husky + commitlint** (Conventional Commits)
- **Docker** + **GitHub Actions** (CI/CD) — ver [Infra & Deploy](#infra--deploy)

## Como rodar

Requisitos: Node 20+ e npm.

```bash
npm install        # instala dependências
npm run dev        # ambiente de dev em http://localhost:3000
npm run build      # build de produção (Nitro node-server)
npm run preview    # serve o build localmente
npm run test       # testes (Vitest)
npm run lint       # ESLint
npm run typecheck  # checagem de tipos (vue-tsc)
npm run seed       # regenera o dataset (server/data/professionals.json)
```

> O dataset (≥ 500 profissionais) já vem **commitado** no repositório — `npm install && npm run dev` funciona **offline e sem nenhuma chave de API** (ver [ADR-006](docs/adr/0006-dados-build-time.md)).

## Funcionalidades (× requisitos do challenge)

| Requisito | Implementação |
|---|---|
| Listagem ≥ 500 profissionais (foto, nome, profissão, valor) | **540** freelancers, grid de cards com imagem, categoria, preço, rating, cidade/distância |
| Busca | por nome, categoria, especialidade e specs (acento-insensível) |
| Filtragem | categoria · preço (range slider) · avaliação · cidade · disponibilidade · verificado · **facetas contextuais por categoria** |
| Ordenação | relevância · preço · avaliação · mais avaliados · distância |
| Carregamento sob demanda | "carregar mais" sobre paginação server-side |
| Responsivo mobile-first | sim, com tema **claro/escuro** |
| Perfil detalhado | página **SSR** `/profissional/[slug]`: galeria, sobre, especialidades, serviços, avaliações, disponibilidade, booking |

**Extras:** lightbox de fotos (quick-view) · favoritos (`/favoritos`) com orçamento em lote · SEO técnico (meta/OG/**JSON-LD**) · página 404 · estados de loading/empty/erro.

## Arquitetura & decisões (ADRs)

Decisões registradas em [`docs/adr/`](docs/adr/):

- **Perfil em página SSR** (não modal) — SEO, LCP, deep-link · [ADR-001](docs/adr/0001-perfil-pagina-dedicada.md)
- **Lightbox** de fotos como quick-view · [ADR-002](docs/adr/0002-lightbox-fotos.md)
- **Tailwind + componentes próprios** + lógica em composables · [ADR-003](docs/adr/0003-tailwind-componentes-proprios.md)
- **Busca no servidor** via Nitro + função pura `applyQuery` (filtro/facetas/ordenação/paginação, testável) · [ADR-004](docs/adr/0004-busca-no-servidor.md)
- **Favoritos** em `localStorage` (client-only) · [ADR-005](docs/adr/0005-favoritos-localstorage.md)
- **Dados em build-time**, JSON commitado, reprodutível sem chave · [ADR-006](docs/adr/0006-dados-build-time.md)
- **Estado na URL** como fonte de verdade + Pinia só p/ favoritos · [ADR-007](docs/adr/0007-estado-url-pinia.md)
- **Deploy Docker** no servidor + Nginx + Cloudflare · [ADR-008](docs/adr/0008-deploy-docker-servidor.md)

Destaques técnicos:
- **Busca facetada** (faceted search): as facetas contextuais por categoria (estilo do DJ, arranjo de som, tipo de fixture…) são o eixo de filtro, com contagens calculadas no servidor.
- **`applyQuery` puro** (`shared/catalog/`): toda a lógica de busca isolada do Nitro → cobertura de testes de alto ROI.
- **Estado na URL**: filtros/ordenação/cidade são compartilháveis e sobrevivem ao refresh; o SSR renderiza a 1ª dobra já filtrada.

## Performance & Core Web Vitals
SSR da primeira dobra; imagens com `width/height` (CLS≈0) e `loading="lazy"`; code-split por rota; fontes com `display: swap`. (Observabilidade de Web Vitals é uma evolução planejada.)

## Acessibilidade
Foco visível (`:focus-visible`), navegação por teclado nos diálogos (ESC, setas no lightbox), `role`/`aria-*`, contraste AA e `prefers-reduced-motion`.

## Testes
Vitest cobrindo o núcleo de maior risco: motor `applyQuery` (filtros/facetas/ordenação/paginação), distância (haversine), round-trip do estado na URL, formatação BRL e o repositório sobre o dataset real.

```bash
npm run test
```

## Estrutura

```
app/            # UI Nuxt: pages, components (ui/catalog/provider), composables, stores, assets
server/         # Nitro API (/api/professionals) + repositório + dataset (data/)
shared/         # domínio + motor de busca (types, catalog/applyQuery, data/cities)
scripts/        # seed.ts (gera o dataset)
tests/unit/     # Vitest
docs/           # PLAN, business-rules, ADRs, AI_USAGE, dev-journal
```

## Uso de IA
Detalhado em [`docs/AI_USAGE.md`](docs/AI_USAGE.md). Em resumo: **Claude Code** (planejamento, código, revisão multi-agente, testes) e **Claude Design** (identidade visual e protótipo das telas). A IA é apoio; as decisões e o domínio são do desenvolvedor (registro em [`docs/dev-journal.md`](docs/dev-journal.md)).

## Dados
Dados e imagens são **fictícios**, para demonstração: nomes/textos via **Faker (pt-BR)**, avatares via **randomuser.me**, fotos via **picsum.photos**. Nenhuma pessoa real está associada aos serviços.

## Melhorias futuras
Geolocalização, comparação lado a lado, "meu evento" (carrinho multi-fornecedor), contas/auth com dashboard do fornecedor, cobertura nacional completa (IBGE) e observabilidade de Web Vitals.

## Infra & Deploy

App no ar em **https://quemfazeventos.com.br**. Entrega via **imagem Docker buildada no CI → GHCR → deploy por SSH → Nginx (reverse proxy) → Cloudflare (TLS)**. Decisões e trade-offs em [docs/adr/0008](docs/adr/0008-deploy-docker-servidor.md).

```
git push main → GitHub Actions
  ├─ CI (ci.yml): lint · typecheck · test · build
  └─ Deploy (deploy.yml): docker build (Linux) → push GHCR → ssh mgmdev
                          → docker compose pull/up → smoke test /api/health
                                        ↓
browser → Cloudflare (TLS) → Nginx :443 → container Nuxt/Nitro :3000
```

### Rodar com Docker (local)
```bash
docker build -t quemfazeventos:local .
docker run --rm -p 3000:3000 quemfazeventos:local
# http://localhost:3000  ·  http://localhost:3000/api/health
```

### Produção
- **Imagem:** `Dockerfile` multi-stage (`node:22-slim`) — ~269 MB, runtime ~65 MB RAM. Build **no CI** (o servidor de 512 MB não builda Nuxt; o CI Linux ainda resolve o `sharp-linux` correto).
- **Servidor:** `docker-compose.yml` em `/opt/quemfazeventos` puxa a imagem do GHCR e expõe `127.0.0.1:3000`; **Nginx** (`deploy/nginx/quemfazeventos.conf`) faz o proxy 80/443 → 3000.
- **CI/CD:** workflows em `.github/workflows/`. Secrets: `SSH_HOST`, `SSH_USER` (user dedicado `deploy`, não-root), `SSH_KEY` (GHCR via `GITHUB_TOKEN`).
- **TLS:** Cloudflare (modo *Full*) + cert self-signed na origem; migração recomendada para *Cloudflare Origin Certificate* (Full Strict).

# Roteiro do vídeo (≤ 5 min) — bullets de fala

> **Cola** (pontos pra falar do seu jeito, sem decorar). Fluxo: tour pelo **código** → **app** → **mobile** → **hospedagem**.
> Objetivo do challenge: *"explicação breve do que foi desenvolvido"*. Ritmo: ~30–40s por seção pra caber em 5 min.
> Antes de gravar: `docker compose up --build` (deixa rodando em http://localhost:3000) e abra o projeto no editor.

## 1. Abertura (~20s)
- "Esse é o **QuemFaz Eventos** — um catálogo de **fornecedores de eventos** (som, luz, DJ, foto, garçom…), feito com **Nuxt 4 + Vue 3 + TypeScript**, no ar em **quemfazeventos.com.br**."
- "Vou navegar pelo **código**, depois pela **aplicação**, e fecho mostrando a **hospedagem com Docker**."

## 2. Estrutura de pastas (~30s) — mostrar a árvore no editor
- **`app/`** — o front Nuxt: `pages/`, `components/` (ui · catalog · provider), `composables/`, `stores/`, `assets/css/`.
- **`server/`** — a **API (Nitro)**: `api/`, `utils/repository.ts`, `data/professionals.json`.
- **`shared/`** — domínio + **motor de busca**: `types/`, `catalog/applyQuery.ts`, `data/cities.ts`. *"Compartilhado entre servidor e cliente."*
- **`docs/`** — ADRs, PLAN, regras de negócio, dev-journal, AI_USAGE. *"Decisões registradas."*
- **`Dockerfile` · `docker-compose*` · `deploy/` · `.github/workflows/`** — infra.
- Fala: *"separação clara — UI, servidor e domínio."*

## 3. Componentes (~40s) — abrir 2 ou 3
- `components/ui/` — **design system próprio** (AppButton, Dialog, Lightbox, RangeSlider). *"Sem lib de UI; componentes puros + tokens do Tailwind + CSS semântico."*
- Abrir o **`ProviderCard.vue`**: *"props tipados, template limpo, estilo no CSS próprio."*
- Abrir o **`composables/useCatalogQuery.ts`**: *"a lógica fica nos composables — aqui o estado dos filtros vive na URL."*
- (opcional) `FilterPanel.vue` → as **facetas contextuais**.

## 4. A API (~40s) — `server/` + navegador
- *"Não há backend separado — é o **Nitro**, que vem no Nuxt."*
- `server/api/professionals/index.get.ts` → **GET /api/professionals**: filtra, ordena, pagina e devolve as contagens das facetas.
- O coração é `shared/catalog/applyQuery.ts` — **função pura** (filtro + facetas + ordenação + paginação), isolada do servidor → por isso é **testável** (**37 testes**, `npm run test`).
- Dados: **540 fornecedores** via **Faker** (seed fixa), em JSON, carregados **em memória**. *"Sem banco, sem chave de API — roda offline."*
- Mostrar no navegador: abrir **`/api/professionals`** e ver o JSON.

## 5. App + navegação (~50s) — a tela
- **Catálogo** (home): 540 cards (foto, categoria, preço, ⭐, cidade).
- **Busca** → **filtros** (categoria, preço, avaliação) → **facetas contextuais por categoria** (*o diferencial*) → **ordenação** → **carregar mais**.
- **Estado na URL**: mexer num filtro e mostrar a **URL mudando** → *"compartilhável e coerente com o SSR."*
- **Perfil** `/profissional/[slug]` (**SSR**): galeria, especialidades, serviços, avaliações → **Solicitar orçamento** (form valida e **loga no console** — abrir DevTools).
- Rápido: **lightbox** de fotos · **favoritos** (`/favoritos`) · **tema claro/escuro**.

## 6. Mobile (~20s)
- *"Mobile-first, responsivo via media queries no CSS próprio."*
- DevTools → modo responsivo (ou o celular): grid em 1 coluna, header colapsado, **filtros em bottom-sheet**.

## 7. Hospedagem com Docker (~60s) — o fechamento
- *"Deploy próprio: imagem **Docker** buildada **no CI** (GitHub Actions) → publicada no **GHCR** → **SSH** no servidor → **Nginx** + **Cloudflare**. Um **`git push` na master** dispara CI + deploy sozinho."*
- **Ver por dentro do container** (a imagem é enxuta — só o build):
  ```bash
  docker exec -it quemfazeventos-dev sh   # entra no container que está rodando
  ls -la                                  # só o .output (sem código-fonte!)
  ls .output/server                       # index.mjs + chunks + node_modules de runtime
  cat .output/nitro.json                  # preset "node-server"
  whoami                                  # node (roda sem ser root)
  exit
  ```
  *"A imagem tem só o `.output` — ~269 MB, sem devDependencies, rodando como usuário não-root."*
- **README**: mostrar a seção **"Como rodar"** — Opção 1 (**Docker**: `docker compose up --build`) e Opção 2 (**sem Docker**: `npm install && npm run dev`).
- **Subir local**: rodar `docker compose up --build` → abrir **http://localhost:3000** → *"é a mesma imagem da produção."*

## 8. Fecho (~15s)
- *"Resumo: catálogo completo (busca, filtros, ordenação, perfil), SSR + SEO, busca facetada testada e deploy próprio automatizado."*
- *"Trade-offs: dados fictícios (Faker/picsum), cidades curadas. Mais detalhes no README e nos ADRs. Obrigado!"*

---
### Comandos prontos (deixe num terminal à parte)
```bash
docker compose up --build -d            # sobe o app (http://localhost:3000)
docker exec -it quemfazeventos-dev sh   # "entrar" no container p/ o ls
docker compose logs -f                  # (opcional) ver o log do /orçamento / web-vitals
docker compose down                     # encerrar
```

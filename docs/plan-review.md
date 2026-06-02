# Revisão do Plano — Gaps & De-risking

> Revisão multi-perspectiva (8 lentes + síntese) do plano, feita antes de codar para encontrar gaps. 75 gaps levantados; aqui está a versão curada e priorizada. Metodologia em si é também evidência de uso estratégico de IA (ver [`AI_USAGE.md`](./AI_USAGE.md)).

## Veredito
O plano é forte em **visão de produto** (persona B2B, cobertura nacional, dados reais) e em diferenciais da vaga. Mas hoje (02/06, ~4 dias úteis) o repo é só scaffold, e **3 deliverables obrigatórios** (solução publicada, vídeo ≤5min, README) dependem de um caminho frágil: deploy Docker num servidor que ainda não dominamos + um pipeline de dados de 4 APIs que ainda não existe. **A correção é de sequenciamento e de-risking, não de mais escopo.**

## 🔴 Blockers (ameaçam o mínimo)
1. **"Publicar" amarrado ao Docker no servidor próprio.** O link público é obrigatório; o único caminho era Docker em `ssh mgmdev`, que não dominamos. → **Vercel/Netlify como caminho PRIMÁRIO garantido; Docker vira diferencial por último, com gatilho de abortar.**
2. **Sem MVP publicado como gate cedo.** 13 fases em série até deploy na fase 12 = risco de chegar ao prazo sem nada no ar. → **"No ar e funciona" é critério de saída do dia 2, não da fase 12.**
3. **Pipeline de dados inexistente e no caminho crítico de tudo.** 4 fontes externas + chave Pexels + dataset de coordenadas inexistente. → **Materializar 500 com Faker pt-BR JÁ, commitar o JSON; build do avaliador nunca chama API externa nem exige chave. APIs reais viram enriquecimento opcional (Fase B).**

## 🟠 Gaps de alta prioridade (agrupados)
- **Estado/SSR:** fluxo **unidirecional** `route.query` = única fonte dos filtros; Pinia guarda **só** resultados/cache/cursor (nunca filtros). Reaproveitar payload SSR na hydration (key determinística) p/ evitar duplo fetch e mismatch. Favoritos = **client-only** (localStorage não existe no server → mismatch garantido).
- **Paginação:** resolver a tensão infinite scroll × URL × SSR. Proposta: SSR só da 1ª página filtrada; demais só no client (fora da URL; reload volta ao topo, documentado); **botão "Carregar mais"** além do IntersectionObserver (a11y + no-JS + teto de DOM) + `aria-live`.
- **API Nitro:** definir **contrato antes da UI** (DTOs card vs perfil, envelope de paginação, erros 404/400). Extrair **função pura `applyQuery`** (filtro/ordenação/paginação) reutilizável e testável fora do Nitro — é o maior ROI de teste.
- **Localização/geo:** combobox estado→cidade no padrão **APG** (acessível) com carga **lazy por UF** (`/api/cities?uf=SP`); só 27 estados no client. **Coordenadas vivem no servidor** (distância calculada lá; client recebe só `distanceKm`). Dataset de centroides precisa de **fonte + licença** definidas (IBGE de localidades NÃO traz lat/lng).
- **Imagens/CWV:** **@nuxt/image não está sequer registrado como módulo** — sem `domains` p/ Pexels/randomuser o `<NuxtImg>` não otimiza. Definir `domains/formats`, **aspect-ratio fixo** (CLS≈0), LCP da dobra `eager`+`fetchpriority=high`, resto lazy. Fontes self-host/system + budget de bundle.
- **CTA de conversão B2B:** a jornada da empresa termina sem desfecho — falta **"Solicitar orçamento/Contato"** no card e perfil (+ canal de contato no domínio). Conectar aos Favoritos ("orçamento dos N favoritos"). Baixo custo, alto sinal de visão de produto.
- **A11y de componentes próprios:** lightbox (focus trap, ESC, setas, `aria-modal`, scroll lock, `inert`) e range slider (dois thumbs `role=slider`, teclado completo, inputs numéricos sincronizados). Sem lib, **toda a a11y é nossa**.
- **SEO técnico:** escolher schema.org (**ProfessionalService**: provider Person, offers em BRL, aggregateRating só quando há nota); **sitemap** dos ≥500 slugs; `site.url` por env; canonical; `/favoritos` e facetas `noindex`.
- **Testes/tooling:** **Vitest não está configurado** (sem `vitest.config`, sem scripts `test/lint/typecheck`). O README do challenge pede esses comandos. Foco do teste: `applyQuery` + round-trip da URL + `formatBRL`/normalização de acento.

## 🟡 Coerência / processo (riscos de credibilidade)
- **Over-claim:** docs citam `docs/adr/` (ADR-001/002/003) e configs como existentes, mas `adr/` não existe e `nuxt.config` é stub. → **Materializar os ADRs e fiar o `nuxt.config` cedo.**
- **SCSS no §6:** prometido "construir leve" sem `sass` instalado e com Tailwind v4. → cumprir com um bloco real OU rebaixar p/ "Documentar".
- **Conventional Commits:** o §6 promete, mas o histórico já viola (2 commits em `main`, sem padrão/branch). → **a partir de agora: feature branches + commits convencionais + 1-2 PRs reais.**
- **i18n pt-BR determinístico** (R$/datas/busca acento-insensível) p/ evitar hydration mismatch.
- **Slug único** (desambiguar colisões de nome no seed). **Distribuição ponderada** determinística (capital sem resultado = péssima 1ª impressão). **Disclaimer** de dados/imagens fictícios (Pexels/randomuser).

## ✅ Sequenciamento revisado (vertical slice primeiro)
1. **Dia 1–2 → MVP publicado (gate):** 500 via Faker em JSON estático · busca · filtros (categoria+preço+avaliação) · ordenação · "carregar mais" · **perfil SSR** · responsivo · **deploy Vercel**. Filtro/ordenação client-side sobre o JSON (rápido de publicar).
2. **Incremento:** migrar p/ **Nitro API** (mesmo contrato → transparente) marcando "consumo de APIs" + SSR da 1ª dobra · lightbox · range slider · `/favoritos` · facets.
3. **Geo/nacional:** MVP com ~8–12 capitais (coordenadas hardcoded — haversine funciona igual); arquitetura pronta p/ nacional; IBGE/5570 municípios só depois.
4. **Enriquecimento de dados (Fase B):** Pexels/IBGE reais via `npm run seed` (lê `.env`, com `.env.example` e fallback).
5. **Diferenciais (nenhum antes do MVP no ar):** CI > Web Vitals > Storybook (só com 4–6 stories de qualidade, senão rebaixar) > Docker dev.
6. **Penúltimo/último dia:** feature-freeze + deploy final + README + vídeo ≤5min (roteiro alimentado pelo `dev-journal`).

## Decisões sobre esta revisão (02/06)
- ✅ **Aceitos:** todos os gaps **técnicos** entram no build.
- ↩️ **Recusados (decisão do usuário, sem prazo fixo):** MVP-first, Vercel-primário e recorte para capitais. Mantém-se **Docker-primário**, **roadmap em série** e **cobertura nacional**. Sem deadline rígido, o risco de prazo cai e os trade-offs foram assumidos conscientemente.

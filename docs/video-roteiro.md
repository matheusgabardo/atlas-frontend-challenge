# Roteiro do vídeo (≤ 5 min)

Guia de narração — não precisa decorar; são os pontos de fala. Demo em https://quemfazeventos.com.br (ou `npm run dev`).

## 0:00–0:30 · Abertura
- "**QuemFaz Eventos** — marketplace B2B que conecta organizadores aos **freelancers que fazem o evento**: DJ, som, luz, foto, garçom, recepção, segurança, cerimonial, valet."
- "Feito com **Nuxt 4 + Vue 3 + TypeScript**, no ar com SSR." (mostrar a URL).

## 0:30–2:15 · Demo (fluxo do usuário)
1. **Catálogo** na home: 540 profissionais, cards com foto, categoria, preço, rating, cidade/distância.
2. **Busca** ("dj", "house") + **pills de categoria**.
3. Selecionar **DJ** → aparecem as **facetas contextuais** (Estilo, Estrutura) — *este é o diferencial*. Abrir **Filtros**: range slider de preço, avaliação, switches.
4. **Chips** de filtros ativos (remover um) + **ordenação**.
5. Trocar **cidade** (CityPicker) → resultados + distância recalculada.
6. **"ver fotos"** → **lightbox** (setas/ESC).
7. Abrir **perfil** (`/profissional/[slug]`): galeria, especialidades, serviços, avaliações, booking → **Solicitar orçamento** (form + sucesso).
8. **♥ favoritar** → **/favoritos** → **orçamento em lote**.
9. (rápido) **tema escuro**.

## 2:15–3:45 · Técnico (decisões)
- **SSR + SEO**: a 1ª dobra e o perfil renderizam no servidor; perfil tem **JSON-LD** (mostrar view-source).
- **API Nitro + `applyQuery` puro**: filtro/facetas/ordenação/paginação no servidor, em uma função isolada e **testável** (29 testes, `npm run test`).
- **Estado na URL** como fonte de verdade → filtros compartilháveis e SSR-coerentes (mostrar a URL mudando).
- **Busca facetada** com contagens por faceta.
- **Design-system** próprio (tokens, claro/escuro) — **Pinia** só pros favoritos.
- **Performance**: imagens dimensionadas (CLS≈0), 1ª dobra eager (LCP), code-split.
- **Deploy**: **Docker** buildado no CI → GHCR → servidor (Nginx + Cloudflare). `git push master` deploya.

## 3:45–4:40 · Uso de IA & autoria
- "Usei **Claude Code** (planejamento, código, **revisão multi-agente** do plano, testes) e **Claude Design** (identidade visual + protótipo das telas)." (ver `docs/AI_USAGE.md`)
- **Decisão que mostra domínio**: o protótipo do Claude Design veio no modelo **freelancer**, diferente de um experimento técnico que eu tinha. **Confirmei o descasamento antes de codar** e segui o design — e como o motor de busca era **genérico**, o pivô custou só tipos + seed, não a arquitetura.
- "As decisões são minhas — registradas em **ADRs** e no **dev-journal**; a IA é ferramenta."

## 4:40–5:00 · Fechamento
- Trade-offs assumidos (dados fictícios via Faker/picsum; cidades curadas).
- Com mais tempo: geolocalização, comparação lado a lado, observabilidade de Web Vitals, cobertura nacional (IBGE).
- "Obrigado!"

# Escopo do MVP — foco no teste

> **1º objetivo: atender o challenge.** Escalar o produto = futuro (mantido fora do repo, em `dados_privados/produto-futuro.md`). Aqui fica só o que entra **agora**.

## Requisitos do challenge → status
| Requisito | Status |
|---|---|
| Listagem ≥ 500 (foto · nome · profissão/categoria · valor) | dados ✅ · UI ⬜ |
| Busca (nome/profissão) | engine ✅ · UI ⬜ |
| Filtragem | engine ✅ (globais + facetas contextuais) · UI ⬜ |
| Ordenação | engine ✅ · UI ⬜ |
| Carregamento sob demanda | ⬜ ("carregar mais" + infinite scroll) |
| Responsivo mobile-first | ⬜ |
| Perfil detalhado (foto · nome · categoria · descrição · valor [+ avaliação/localização]) | dados/API ✅ · UI ⬜ |

## Diferenciais mantidos no MVP (alto valor / baixo custo)
- **SSR + SEO técnico** (meta/OG/JSON-LD) no perfil · **@nuxt/image** (CWV)
- **Facetas contextuais por specs** (nosso diferencial de modelagem)
- **Cidade-first**: modal estado→cidade + distância (sobre as ~36 cidades curadas)
- **Lightbox** de fotos · **Favoritos** (localStorage) + `/favoritos`
- **Data do evento**: filtro simples (engine pronta), UI mínima
- A11y básica · **testes Vitest** · Conventional Commits · ADRs · README · AI_USAGE
- **CI** (lint/test/build) ✅ · **Web Vitals** (baratos) · **Deploy** ✅ no ar em quemfazeventos.com.br (Docker + Nginx + Cloudflare)

## Fora do MVP → futuro (`dados_privados/produto-futuro.md`)
Cobertura nacional completa (IBGE 5570 + coords) · geolocalização · "meu evento"/carrinho · comparação lado a lado · mapa · contas/auth · dashboard fornecedor · pós-orçamento (notificação/tracking/chat) · modelo de negócio · enriquecimento real de dados · agenda/booking real · **Storybook** (só se sobrar tempo).

## Regra de ouro
Nada de escalar agora. Qualquer ideia nova de produto → vai para `dados_privados/produto-futuro.md`, não para o MVP.

# Regras de Negócio & Modelo de Domínio

> Domínio: marketplace de **freelancers de eventos** (alinhado ao protótipo do Claude Design). Documento vivo. Histórico de escopo em §7.

## 0. Contexto / persona (B2B)
O usuário são **organizadores** (produtoras, casas de festa, empresas, noivos) que precisam **encontrar e contratar freelancers de eventos por cidade**. Orienta a copy ("encontre quem faz o seu evento"), a busca por cidade e a solicitação de orçamento.

## 1. Entidades

### Professional (freelancer ou equipe)
`id` · `slug` · `name` · `avatar` (foto p/ `pessoa`; iniciais p/ `equipe`) · `category` · `providerType` (`pessoa` = Freelancer · `equipe` = Equipe) · `keySpecs` (1–2 destaques do card) · `specs` (valores das facetas, ver abaixo) · `headline` · `bio` · `description` · `location` (state/city/lat/lng) · `priceFrom` · `priceModel` (`evento`/`diaria`/`hora`) · `rating` (0–5 \| null="Novo") · `reviewsCount` · `reviews[]` · `services[]` · `gallery[]` (MediaAsset) · `availability` · `verified` · `weekend` · `operator` (leva equipamento) · `yearsExperience` · `completedJobs` · `responseTime`.

### Category (9)
DJ · Sonorização · Iluminação · Fotografia · Garçom & Bar · Recepção · Segurança · Cerimonial · Valet. Cada categoria tem `label` + `icon` (SVG).

### Facetas contextuais (o diferencial — `CONTEXTUAL_FACETS`)
Por categoria, facetas `multi` (enum, multi-seleção OR) ou `bool`. Ex.: DJ → Estilo (Open format/House/…) + Estrutura (bool); Som → Arranjo (Line array/Ponto) + Console; Luz → Tipo de fixture + Mesa; Foto → Tipo + Prazo; etc. As facetas e suas contagens vêm de `/api/professionals` (recalculadas conforme a seleção).

### Service · Review · Availability · MediaAsset
- **Service:** `name`, `description`, `priceFrom`, `priceModel`.
- **Review:** `author`, `rating` (1–5), `comment`, `date` (ISO), `eventType?`.
- **Availability:** `weekdays`, `nextAvailableDate`, `bookedDates[]` (p/ filtro por data do evento).
- **MediaAsset:** `url`, `width`, `height`, `alt`.

### Location — cobertura por cidade
`state` (UF), `city`, `lat`, `lng`. Conjunto curado de capitais/cidades grandes (`shared/data/cities.ts`) com coordenadas → distância via haversine a partir da cidade selecionada.

## 2. Regras
- **Busca:** casa por `name` OU categoria OU `keySpecs`/specs (case/acento-insensível, debounce).
- **Filtros globais:** categoria (multi) · preço (range slider) · avaliação mínima · cidade/estado · disponível fim de semana · verificado · leva equipamento.
- **Filtros contextuais:** aparecem conforme a categoria selecionada (facetas).
- **Ordenação:** relevância (verificado→rating→reviews) · preço ↑/↓ · avaliação · mais avaliados · distância.
- **Rating:** média das reviews; sem reviews ⇒ "Novo" (fora do filtro de avaliação).
- **Distância:** calculada no servidor a partir da cidade de referência (selecionada).
- **Paginação:** server-side (~24/página); front carrega sob demanda ("carregar mais").

## 3. Card
foto · nome · categoria + tipo (Freelancer/Equipe) · 1–2 `keySpecs` · "a partir de R$ X/modelo" · ⭐ rating (nº) · cidade/distância · selo "verificado" · CTAs ♥ favoritar e "ver fotos" (lightbox). Clique ⇒ perfil.

**Favoritos:** `localStorage` (item opcional do challenge) → tela `/favoritos` com orçamento em lote.

## 4. Fontes de dados (build-time, commitadas — reprodutível sem chave)
- **Faker (pt-BR, seed fixa):** nomes, bios, headlines, preços, reviews, disponibilidade, specs.
- **randomuser.me:** avatar dos `pessoa` (URL estática construída, sem chamar a API).
- **picsum.photos:** galeria/portfólio (URLs determinísticas).
- **`shared/data/cities.ts`:** estados/cidades + coordenadas.

## 5. Decisões fechadas ✅
- Persona B2B; busca por cidade central.
- 9 categorias de serviço + facetas contextuais por categoria.
- Distância via cidade selecionada (cidades curadas no MVP).
- Filtro de preço por range slider; favoritos em localStorage.
- Entrada: listagem na `/` (homepage), CityPicker no header.

## 6. Fora do escopo (futuro — `dados_privados/produto-futuro.md`)
Geolocalização · comparação lado a lado · "meu evento"/carrinho · contas/auth + dashboard do fornecedor · pós-orçamento real (notificação/tracking) · cobertura nacional completa (IBGE) · modelo de negócio.

## 7. Histórico de escopo
- **v1–v2:** catálogo generalista de eventos (~30 categorias).
- **v3 (técnico):** experimento estreitando para estrutura técnica AV (som/luz/LED/palco/gerador) com specs como discriminated union.
- **Atual (freelancers):** alinhado ao protótipo entregue pelo **Claude Design** — marketplace de freelancers de eventos (9 categorias, specs flat + facetas contextuais, Freelancer/Equipe). O motor de busca (`applyQuery`), a API e os testes foram preservados; trocou-se o **modelo de domínio**.

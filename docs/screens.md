# Telas & Componentes (input p/ Figma) — v3

Marca: **Freelance para Eventos** (`freelanceparaeventos.com.br`). Nicho: **estrutura técnica para eventos** (som · luz · LED · projeção · palco · energia). Persona: empresas/organizadores **alugando/contratando estrutura por cidade**. Domínio completo em [`business-rules.md`](./business-rules.md).

Diferencial de UX/modelagem: **busca facetada** — filtros **contextuais por categoria** (specs técnicas) além dos globais.

## Rotas
- `/` — catálogo (SSR da 1ª dobra)
- `/profissional/[slug]` — perfil do fornecedor (SSR)
- `/favoritos` — client-only (hidrata do localStorage)
- `/404`

## Design tokens (ponto de partida)
- **Cores:** primária + neutros + sucesso/aviso/erro + cor do selo "verificado".
- **Tipografia:** 1 família (self-host ou system), escala tipográfica.
- **Base:** espaçamento 4px, raios, sombras. **Breakpoints:** 360 / 768 / 1024 / 1440. **Grid de cards:** 1→2→3→4 colunas.

## `/` Catálogo
- **Header:** logo · busca (nome/categoria/**spec**: "line array", "P2.6", "gerador silenciado") · seletor de cidade (estado→cidade) · favoritos (com contador).
- **Filtros** (desktop: sidebar · mobile: bottom-sheet "Filtros"):
  - **Globais:** categoria (multi) · preço (range slider) · avaliação mín. · cidade/estado · disponível fim de semana · verificado · porte/público · marca · operador incluso.
  - **Contextuais** (aparecem conforme a categoria — o diferencial): LED → pixel pitch + indoor/outdoor · Luz → tipo de fixture + treliça · Som → line array/ponto + console · Gerador → kVA + silenciado · Projeção → lúmens + mapping · Palco → tipo de estrutura + cobertura. Contagens recalculadas via `/api/facets`.
  - Chips de filtros ativos + "limpar". Contador "Ver N resultados" ao vivo.
- **Ordenação** (select): relevância · preço ↑/↓ · avaliação · distância · mais avaliados · (opcional) maior capacidade/potência.
- **Resultados:** grid de `ProviderCard` · "Carregar mais" + infinite scroll · `aria-live` de contagem.
- **Estados:** skeleton dimensionado · vazio-busca ("limpar filtros") · vazio-cidade ("cidades próximas: …") · erro (retry).

### Card (fornecedor)
foto (equipamento/montagem, aspect-ratio fixo) · nome do fornecedor · categoria · **1–2 specs-chave** · "a partir de R$ X / diária" · ⭐ rating (nº) · cidade/distância · selo "verificado". **CTAs:** ♥ favoritar · "ver fotos" (lightbox) · "Solicitar orçamento". Nome/foto = link "stretched" → perfil.
> Specs-chave por categoria: "Line array · até 5.000 pax" · "LED P2.6 · 40 m² · indoor" · "Gerador 180 kVA silenciado" · "Grid Q30 · 24 movings".

## `/profissional/[slug]` Perfil (SSR)
- **Header:** logo/foto · nome do fornecedor · categoria · cidade/distância · ⭐ rating (nº) · selo · responseTime · anos/eventos atendidos. **CTA primário "Solicitar orçamento"** + ♥.
- **Blocos:** galeria (abre lightbox) · **specs técnicas** (tabela por categoria — o diferencial) · descrição · serviços/pacotes (ex.: "PA fly + 4 monitores + operador", preço/modelo) · avaliações (lista + média) · disponibilidade (dias/próx. data) · localização (cidade).
- **SEO:** meta/OG + **JSON-LD ProfessionalService** (offers em BRL, areaServed=cidade, aggregateRating só com nota). **404** para slug inexistente.

## `/favoritos`
Lista de cards favoritados (client-only) · empty com CTA p/ catálogo · ação em lote **"Solicitar orçamento dos N favoritos"**.

## Inventário de componentes → design system
- **ui/**: AppButton · AppBadge (selo) · SpecBadge (spec-chave) · RatingStars · PriceTag · Skeleton · Dialog (base p/ lightbox+drawer+modal) · Lightbox · RangeSlider · Combobox · Chip · EmptyState · ErrorState · FavoriteButton.
- **catalog/**: SearchBar · CityPicker · FilterPanel · ContextualFacets (facetas por categoria) · FilterDrawer (mobile) · SortSelect · ActiveFilters · ResultsGrid · LoadMore.
- **provider/**: ProviderCard · ProviderHeader · Gallery · SpecsTable · ServicesList · ReviewsList · Availability · QuoteModal (orçamento mockado).
- **layout/**: AppHeader · AppFooter.

## Fluxos-chave
1. Buscar → escolher categoria → **facetas contextuais aparecem** → filtrar/ordenar → resultado (estado na URL).
2. Card → "ver fotos" → lightbox (teclado/ESC/setas).
3. Card/perfil → "Solicitar orçamento" → modal (form mockado).
4. ♥ favoritar → `/favoritos` → orçamento em lote.

## A11y (componentes próprios = a11y é nossa)
- **Dialog/Lightbox/Drawer:** `role=dialog` · `aria-modal` · focus trap · ESC · `inert` no fundo · restaura foco. Lightbox: setas ←/→ + `aria-live` ("foto 2 de 8").
- **Combobox cidade:** padrão APG (combobox+listbox) · lazy por UF · lista virtualizada · type-ahead · `aria-live` de contagem.
- **RangeSlider:** 2 thumbs `role=slider` · teclado completo · inputs numéricos sincronizados (alternativa precisa).
- **FavoriteButton:** `aria-pressed` + label dinâmico.

---

## Ajustes do vet multi-perspectiva (pré-Figma)

> 49 gaps → clusters abaixo. Desenhar **todos os estados** de cada item (não só o "happy path").

### 🔴 Highs
1. **QuoteModal (orçamento):** modal no desktop / **sheet full-screen no mobile** (CTA fixo, scroll acima do teclado). Campos + validação · contexto do fornecedor · estados `submitting`/`success`/`error` · **tela de sucesso** ("recebemos seu pedido" + próximo passo) · variantes **single** (1 fornecedor) e **lote** (N favoritos).
2. **Matriz de estados + componentes base:** desenhar `default/loading/empty/error/disabled/focus/hover` para Card, ResultsGrid, CityPicker, Gallery, ContextualFacets e blocos do Perfil. **AppButton** = variant × size × (loading/disabled/icon-only); **AppBadge** = verified/new/promo.
3. **Foco & contraste (WCAG):** token de **focus-ring** (cor/espessura/offset, contraste ≥3:1) + estado `:focus-visible` em card, chips (com "x" rotulado), thumbs do slider, combobox, FavoriteButton e CTAs. Texto ≥4.5:1 ("a partir de R$", distância, selo).
4. **CityPicker mobile:** sheet full-screen (busca no topo, lista UF→cidade, fechar ≥44px) + estados loading (lazy por UF), "nenhuma cidade", opção ativa (`aria-activedescendant`), cidade desabilitada sem UF. **Onboarding sem cidade:** definir default ou prompt (sem cidade ⇒ sem ordenar-por-distância).

### 🟡 Médios
- **Header mobile** colapsado (logo + ♥ com contador fixos; busca/cidade em 2ª linha/overlay) + **toolbar sticky ≥48px** (Filtros c/ badge de ativos · Ordenar · "N resultados" live). **Ordenar e Filtros = bottom-sheet** (grabber, header sticky "limpar", CTA "Ver N resultados" fixo ≥44px).
- **Card:** "Solicitar orçamento" primário ≥44px · ♥ no canto da foto · "ver fotos" via tap · resto = stretched-link (sem disparar navegação ao clicar nos botões). Variantes: `rating null` = **"Novo"** (fora do filtro de avaliação) · sem `distanceKm` · sem selo · preço por `priceModel`.
- **Facetas contextuais:** estado vazio quando a categoria não tem aquela faceta · contagens zeradas desabilitadas · resetar contextuais ao trocar de categoria.
- **RangeSlider:** hit-area dos thumbs ≥44px · inputs min/max com erro (min>max, fora da faixa) · regra de cruzamento. **FavoriteButton:** 4 estados (ativo/inativo × hover/focus) com **sinal além da cor** (preenchido vs contorno) · toggle otimista + toast "salvo".
- **Dialog = primitivo** (overlay/focus-trap/close/foco inicial/retorno); **Lightbox, FilterDrawer e QuoteModal = composições**. Lightbox mobile: swipe + "foto X de N". **EmptyState** com slots (3 instâncias: vazio-busca "limpar", vazio-cidade com chips de cidades próximas clicáveis, favoritos vazio) + **ErrorState** retry focável. **Skeleton** espelhando aspect-ratio real (CLS≈0). **RatingStars** readonly vs interactive + meia-estrela.

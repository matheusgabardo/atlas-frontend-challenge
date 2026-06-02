# Regras de Negócio & Modelo de Domínio (v3)

> Domínio: catálogo de **fornecedores de estrutura técnica para eventos** — sonorização, iluminação, painel de LED, palco/treliça, energia e projeção. Documento vivo; ajustado conforme as decisões com o Matheus.
>
> **v3:** foco estreitado de "eventos em geral" (~31 categorias) para o **nicho técnico audiovisual** (6 categorias). Motivo e histórico em §6.

## 0. Contexto / persona (B2B)
O usuário final são **empresas e organizadores** (produtoras de eventos, casas de show, igrejas, agências, organizadores de eventos corporativos) que precisam **alugar/contratar estrutura técnica por cidade**. Isso orienta a copy ("Encontre estrutura de som, luz e LED para o seu evento"), a navegação (busca **por cidade** é central) e a cobertura **nacional**. O fornecedor pode ser **empresa/locadora**, **produtora** ou **técnico autônomo** (ver `providerType`).

## 1. Entidades

### Fornecedor (entidade principal)
Tecnicamente o tipo `Professional` (mantido no código/API/rota `/profissional/[slug]`), conceitualmente um **fornecedor** de estrutura.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | identificador |
| `slug` | string | URL do perfil (`/profissional/[slug]`) |
| `name` | string | nome do fornecedor (empresa/locadora) ou da pessoa (autônomo) |
| `avatar` | string (url) | logo (empresa/locadora) ou foto (autônomo); fallback iniciais+cor |
| `category` | Category | categoria técnica principal |
| `providerType` | `pessoa \| empresa \| locacao` | autônomo · produtora/equipe · locadora de equipamento |
| `specs` | TechSpecs | **specs técnicas por categoria** (filtráveis) — ver entidade abaixo |
| `headline` | string | chamada curta (ex.: "Line array d&b até 5.000 pessoas") |
| `bio` | string | resumo curto (card) |
| `description` | string | descrição completa (perfil) |
| `location` | Location | estado + cidade (+ coordenadas) |
| `distanceKm` | number | calculado em runtime (cidade de referência → cidade do fornecedor) |
| `priceFrom` | number | "a partir de" (R$) |
| `priceModel` | `por_diaria \| por_evento \| por_hora` | locação é majoritariamente por **diária/evento** |
| `rating` | number (0–5) \| null | média; `null` ⇒ "Novo" |
| `reviewsCount` | number | total de avaliações |
| `reviews` | Review[] | avaliações |
| `services` | Service[] | pacotes (ex.: "PA + monitor + operador") |
| `gallery` | MediaAsset[] | portfólio do equipamento/montagem (Pexels) — usado no lightbox |
| `availability` | Availability | disponibilidade/agenda |
| `verified` | boolean | selo de verificado |
| `yearsExperience` | number | tempo de atuação no mercado |
| `completedJobs` | number | eventos atendidos |
| `responseTime` | string | ex.: "responde em ~2h" |

### Category (categoria técnica)
`id`, `slug`, `label`, `icon`, `group`. **6 categorias** em 3 grupos:
- **Som & Luz:** Sonorização (Técnico de som) · Iluminação/VJ
- **Imagem:** Painel de LED/Telão · Projeção & Mapping
- **Estrutura & Energia:** Palco/Treliça/Estrutura · Gerador/Energia

> O repertório completo do mercado de eventos (~74 categorias) está documentado **fora do código** — o foco no nicho técnico é uma decisão de autoria/profundidade (§6).

### TechSpecs (specs técnicas por categoria)
Union discriminada por `category`. São o **principal eixo de filtro** (compensam a taxonomia enxuta) e o diferencial de modelagem.

**Comuns** (onde aplicável): `capacityTier` (pequeno ≤100 · médio ≤500 · grande ≤5.000 · open-air >5.000) · `audienceMax` · `brands[]` · `operatorIncluded` (bool).

| Categoria | Specs específicas (**negrito** = vira faceta de filtro) |
|---|---|
| Sonorização | **systemType** (line array · ponto · coluna) · powerWRms · **consoleType** (analógica/digital) · monitoring (wedge/in-ear) · micChannels |
| Iluminação/VJ | **fixtureTypes** (moving beam/wash/spot · PAR LED · strobo · laser) · fixtureCount · **trussType** (Q30/Q50/box) · hazer · mappingCapable |
| Painel de LED | **environment** (indoor/outdoor) · **pixelPitch** (P1.5–P10) · areaM2 · brightnessNits · **format** (parede/totem/piso/criativo) |
| Projeção & Mapping | **projectorLumens** (ANSI) · projectorCount · **mappingCapable** · **screenType** (frontal/retro/superfície) · screenSizeM |
| Palco/Treliça | **structureType** (palco modular · treliça/grid · ground support · praticável) · stageAreaM2 · **roofIncluded** · maxLoadKg |
| Gerador/Energia | **powerKva** · **fuelType** (diesel/gasolina) · **silenced** (cabinado) · **phases** (mono/trifásico) · atsIncluded |

### Location (localização) — cobertura nacional
`state` (UF), `city`, `ibgeCode`, `lat`, `lng`. Fonte: **API IBGE** (estados/municípios) + dataset de **coordenadas** por município, cacheados em build-time.

### Service · Review · Availability · MediaAsset
- **Service:** `name`, `description`, `priceFrom`, `priceModel` (ex.: "PA fly + 4 monitores + operador").
- **Review:** `author`, `rating` (1–5), `comment`, `date`, `eventType?` (show, corporativo, igreja…).
- **Availability:** `weekdays`, `nextAvailableDate`, `availableThisWeekend`.
- **MediaAsset:** `url`, `width`, `height`, `alt`.

## 2. Regras

**Busca:** casa por `name` OU `category.label` OU `headline`/serviços OU **termos de spec** (ex.: "line array", "P2.6", "gerador silenciado") — case/acento-insensível, com debounce.

**Localização (filtro central):** seletor **estado → cidade** com busca (combobox). Lista **todos** os estados/cidades; cidades carregadas por estado sob demanda. Distância calculada (haversine) a partir da **cidade selecionada** ou da **geolocalização** (opcional, com fallback).

**Distribuição dos dados:** os ≥500 fornecedores são **concentrados em capitais e cidades grandes** (distribuição ponderada). Com 6 categorias, a densidade é alta (~80+/categoria), então os filtros sempre retornam resultado. Cidade sem fornecedores ⇒ **empty state** com sugestão de cidades próximas.

**Filtros:**
- **Globais:** Categoria (múltipla) · **Preço** (range slider min–max) · Avaliação mínima (≥4, ≥4.5) · Cidade/estado · Disponível neste fim de semana · Verificado · **Porte/público** · **Marca** · **Operador incluso**.
- **Contextuais** (aparecem conforme a categoria selecionada — diferencial de UX): pixel pitch + indoor/outdoor (LED) · tipo de fixture + treliça (luz) · line array/ponto + console (som) · kVA + silenciado (gerador) · lúmens + mapping (projeção) · tipo de estrutura + cobertura (palco). Facetas e contagens vêm de `/api/facets`, recalculadas conforme a seleção.

**Ordenação:** Relevância (padrão) · Preço (↑/↓) · Avaliação (↓) · Distância (↑) · Mais avaliados · (opcional) Maior capacidade/potência.

**Preço:** exibido como "a partir de R$ X / {modelo}" (majoritariamente por diária/evento). Filtro por faixa (slider) sobre `priceFrom`.

**Rating:** média de `reviews`; sem reviews ⇒ "Novo" (fora do filtro de avaliação mínima).

**Paginação:** server-side (~24 itens/página); front carrega sob demanda (infinite scroll).

## 3. Campos do card ✅
`foto (equipamento/montagem) · nome do fornecedor · categoria · 1–2 specs-chave contextuais · "a partir de R$ X/diária" · ⭐ rating (nº reviews) · cidade/distância · selo "verificado"` + micro-CTAs **"ver fotos"** (lightbox) e **favoritar ♥**. Clique no card ⇒ perfil.

Exemplos de specs-chave: "Line array · até 5.000 pax" · "LED P2.6 · 40 m² · indoor" · "Gerador 180 kVA silenciado" · "Grid Q30 · 24 movings".

**Favoritos:** persistidos em `localStorage` (atende ao item opcional do challenge "persistência e compartilhamento de estado"). Justifica uma **tela de Favoritos** (empresa salva fornecedores de interesse) — a prever no desenho das telas.

## 4. Fontes de dados (todas cacheadas em build-time)
- **Faker (seed fixa)** — nomes de fornecedores (empresa/locadora), bios, headlines, preços, reviews, disponibilidade e **specs técnicas** (ranges realistas por categoria/porte). É a fonte primária agora.
- **randomuser.me** — foto/avatar dos fornecedores tipo `pessoa` (técnico autônomo/VJ) — sem chave.
- **Pexels API** — galeria por categoria (queries: "concert line array", "stage lighting moving head", "led wall stage", "truss stage structure", "event projection mapping", "power generator event") — chave usada só no build.
- **IBGE + dataset de municípios** — estados, cidades e coordenadas.
- Logos de empresa: gerados (iniciais + cor) para não depender de marcas reais.

## 5. Decisões fechadas ✅ / pendentes ⏳
- ✅ Persona B2B (empresas/organizadores alugando estrutura técnica por cidade)
- ✅ Cobertura nacional (todos estados/cidades, via IBGE)
- ✅ Distância: seletor de cidade + geoloc opcional
- ✅ Filtro de preço: range slider (min–max)
- ✅ **Foco no nicho técnico AV: 6 categorias** (Sonorização · Iluminação/VJ · Painel de LED · Projeção & Mapping · Palco/Treliça · Gerador/Energia) em 3 grupos. Pivô do generalista (31 cat.) para profundidade defensável — autoria: background real em áudio/eventos. Repertório completo (~74) fora do código.
- ✅ **Specs técnicas profundas** como facetas (filtros contextuais por categoria) — principal diferencial de UX/modelagem, compensa a taxonomia enxuta.
- ⏳ Campos do card (validar as specs-chave exibidas por categoria)
- ⏳ Distribuição ponderada + empty state com cidades próximas (validar abordagem)
- ⏳ `providerType` por categoria (proporção empresa/locadora vs. autônomo no seed)

## 6. Histórico de escopo
- **v1–v2:** catálogo generalista de eventos (~30–31 categorias, 10 grupos; entidade ampliada para "fornecedor" com `providerType`).
- **v3 (atual):** estreitado para **estrutura técnica AV** (6 categorias). Motivo: autoria/profundidade (background real em som/eventos) e filtros que demonstram **domínio** (specs técnicas) em vez de amplitude rasa. A taxonomia generalista vira **repertório documentado**, não código. Ganho colateral: densidade de dados alta e filtros contextuais ricos — melhor vitrine para o que o challenge avalia (busca/filtros/facetas/UX).

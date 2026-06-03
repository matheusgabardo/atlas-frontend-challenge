# Jornada de Desenvolvimento & Decisões (autoria / essência)

> **Propósito.** Registro contínuo das decisões e dos pontos sutis que carregam a **essência do Matheus** como desenvolvedor — para preservar a autoria da solução (a IA é apoio, as decisões são dele), alimentar o README, o [`AI_USAGE.md`](./AI_USAGE.md) e os pontos de fala da entrevista técnica.
>
> **Como funciona o "observador".** A cada checkpoint relevante do desenvolvimento, este arquivo é atualizado com: o que foi decidido, **a contribuição/raciocínio do Matheus**, o papel da IA e o trade-off considerado. Em fronteiras de fase, uma revisão dedicada relê conversa + diff para destilar novos pontos de essência.
>
> Formato de cada entrada: `Data — Fase — Decisão | Essência do Matheus | Papel da IA | Trade-off`.

---

## 2026-06-01 — Planejamento inicial

- **Escolha do segmento (eventos/audiovisual).**
  - *Essência:* não foi um tema genérico — veio do repertório real do Matheus (curso técnico de som, vivência em eventos, sistema de gestão audiovisual no portfólio). Escolha que ele consegue defender com propriedade.
  - *IA:* sugeriu opções e apontou que "serviços para casa" seria a escolha mais provável dos demais candidatos.
  - *Trade-off:* tema pesa pouco na avaliação; priorizamos autenticidade + riqueza para os opcionais (galeria, agenda, preços variados).

- **Preocupação com originalidade/diferenciação.**
  - *Essência:* perguntou explicitamente a probabilidade de a IA sugerir os mesmos tópicos a outros candidatos — pensamento estratégico de produto, não só de código.

- **Perfil em página dedicada (SSR) — ADR-001.**
  - *Essência:* pediu para registrar o porquê (SEO + performance) e comparou com a concorrência do ramo (perfis em modal-com-URL), pedindo para documentar por que essa abordagem é inferior mesmo tendo URL.
  - *IA:* estruturou os trade-offs (duas trilhas de render, LCP/indexação, CLS, foco/back-button).

- **Lightbox de fotos como melhoria de UX — ADR-002.**
  - *Essência:* propôs uma visualização rápida de fotos para reduzir fricção ("dar uma olhada" sem navegar), deixando claro que a navegação por rota continua sendo a principal por performance/SEO. Equilíbrio maduro entre UX e performance.

- **Tailwind + componentes próprios + lógica em composables — ADR-003.**
  - *Essência:* defendeu componentes puros com Tailwind e lógica abstraída para reuso — controle do design system e separação apresentação/lógica.

- **Deploy próprio com Docker, "com calma".**
  - *Essência:* quer subir no próprio servidor (`ssh mgmdev`) e admitiu não dominar Docker, pedindo para irmos devagar e entendermos cada passo — honestidade intelectual + vontade de dominar o ciclo completo (build/deploy/manutenção).

- **Processo: regras de negócio → telas → Figma → implementação.**
  - *Essência:* pediu para planejar domínio e telas antes de codar UI e só então gerar layouts no Figma — maturidade de processo e mentalidade ágil (refinamento antes da execução).

- **Validação crítica das escolhas da IA.**
  - *Essência:* questionou o método de scaffold ("não era melhor gerar direto da doc?"), exigindo entender e validar o que a ferramenta fez antes de seguir — exatamente o "avaliar criticamente sugestões da IA" que a vaga pede.

---

## 2026-06-02 — Decisões de stack e escopo

- **Estado com Pinia (reconsiderado).**
  - *Essência:* priorizou a aderência à vaga (que pede Pinia/Vuex explicitamente) sobre a micro-otimização de bundle que a IA havia sugerido. Decisão consciente do contexto (vaga sênior), não dogmática.
  - *IA:* havia sugerido "só composables"; ele pediu reconsiderar à luz dos requisitos da vaga.

- **Ambição calibrada nos diferenciais.**
  - *Essência:* optou por incluir os 4 diferenciais (Storybook, CI, Web Vitals, Docker no dev), mas sob a regra explícita "challenge primeiro" — equilíbrio entre mostrar repertório e não inflar escopo.

- **Barra de qualidade nos dados.**
  - *Essência:* recusou dados genéricos e pediu APIs públicas reais (randomuser.me + Pexels) cacheadas em build-time — cuidado com fidelidade/realismo do produto sem penalizar performance de runtime.

---

## 2026-06-02 — Regras de negócio (persona & cobertura)

- **Enquadramento B2B do produto.**
  - *Essência:* definiu que o usuário final são **empresas** buscando profissionais por cidade — não consumidor final. Visão de produto/mercado que orienta copy, navegação e a centralidade da busca por cidade.

- **Cobertura nacional por cidade.**
  - *Essência:* exigiu listar **todos os estados e cidades** do Brasil, priorizando abrangência/realismo do uso B2B em vez de um recorte conveniente.
  - *IA:* levantou a implicação técnica (dataset IBGE + coordenadas, combobox pesquisável, cidades vazias) e propôs distribuição ponderada + empty state com cidades próximas.

- **Preço por range slider; distância por cidade+geoloc.**
  - *Essência:* preferiu o range slider por ser mais honesto frente à variação de preços do mercado de eventos.

- **Expertise de domínio na taxonomia de categorias.**
  - *Essência:* sugeriu categorias que só quem viveu o operacional de eventos lembra — ex.: "limpeza para eventos em horários específicos" e "animador de festa". Sinal concreto de conhecimento real do mercado, não genérico.

- **Stress-test do próprio plano antes de codar.**
  - *Essência:* pediu para revisar o plano e trazer gaps ANTES de escrever código — mentalidade de risco/qualidade de sênior (de-riscar cedo em vez de descobrir tarde). Resultado: ver [`plan-review.md`](./plan-review.md).
  - *IA:* rodamos um workflow multi-agente (8 lentes independentes + síntese) que levantou 75 gaps e expôs que o maior risco era entregabilidade (deploy/dados/sequenciamento), não a qualidade do código. Uso estratégico de IA como ferramenta de revisão/automação — diferencial explícito da vaga (engenharia de prompts, automação assistida por LLM).
  - *Nota:* a **sacada da revisão multi-perspectiva foi do Matheus** — replicaremos a técnica em pontos-chave (ex.: vet das telas antes do Figma).

- **Marca & decisões pós-revisão.**
  - *Marca (aposta inicial, depois revista — ver 2026-06-03):* "Freelance para Eventos" — direto e orientado ao benefício, mas anglicismo + genérico, e "freelance" colidia com fornecedores que são empresas/locadoras.
  - *Essência:* após a revisão, manteve Docker-no-servidor (primário), roadmap em série e cobertura nacional, **sem prazo fixo** — preferiu profundidade/qualidade a um MVP enxuto, assumindo os trade-offs de forma consciente. Os gaps técnicos seguem no plano.

- **Pivô de escopo (v3): nicho técnico audiovisual.**
  - *Essência:* estreitou de "eventos em geral" (~31 categorias) para **estrutura técnica** (som · luz · LED · projeção · palco · gerador — 6 categorias). Motivo dele: **profundidade defensável** sobre o domínio real (som/eventos) em vez de amplitude rasa. A taxonomia generalista (~74) virou repertório em `dados_privados/` (fora do código).
  - ◆ *Padrão:* as **specs técnicas viram facetas** (faceted search), modeladas como **discriminated union** por categoria — o domínio do Matheus vira o diferencial de modelagem/UX. Marca/contexto B2B preservados.

- **Escopo dos incrementos (feedback do Claude Design).**
  - *Essência:* filtrou as sugestões com critério — adotou só o **seletor de data do evento** (central pra aluguel), recusou comparação/carrinho/mapa (evita scope creep) e **parou o fluxo de conta/orçamento** até definir posicionamento/modelo. Priorização madura: profundidade no que importa, sem inflar escopo. Tokens visuais ficam para depois do nome/marca.

---

## 2026-06-03 — Marca definida: QuemFaz Eventos

- **Escolha do nome após ~500 candidatos.**
  - *Essência:* recusou fechar no fácil ("Freelance para Eventos") e explorou exaustivamente várias filosofias de naming (conexão, garimpo, marca-limpa) antes de decidir — exigência com a identidade do produto.
  - *Essência (virada-chave):* **corrigiu o posicionamento** no meio do processo — "não somos o time que faz o evento; intermediamos quem quer fazer com quem faz". Isso descartou nomes de produtor (Elenco/Trupe) e levou ao **QuemFaz Eventos**, que captura a intenção de busca do organizador ("quem faz meu som/foto/buffet?") e abrange qualquer fornecedor — pessoa, empresa ou locadora —, resolvendo o furo do "freelance".
  - *Risco consciente:* a IA alertou que já existe um "QuemFaz" ativo (marketplace de serviços locais, Batatais/SP) em ramo adjacente — risco real de colisão de marca (INPI classe 35/41). O Matheus optou por seguir; **validar no INPI antes de registrar a marca**.
  - ◆ *Padrão (branding):* nome de **intermediário** evoca o encontro/a busca, não a execução; e marca forte troca a *mecânica* ("conecta X") por *intenção/metáfora* — daí "QuemFaz" (a pergunta do cliente) e o vice "garimpaeventos" (a metáfora).
  - *IA:* gerou/agrupou ~500 nomes via workflows multi-agente (fan-out por ângulo) e fez a checagem de colisão que levantou o xará — IA como motor de divergência + due diligence.

---

## 2026-06-03 — Ambiente de deploy (Docker + CI/CD) antes da app

- **De-riscar o deploy cedo (o maior risco do projeto).**
  - *Essência:* decidiu montar todo o pipeline de deploy **com a app ainda em esqueleto** — atacando o gap nº1 da revisão (entregabilidade), em vez de empurrar o deploy pra última fase. Mentalidade de risco/qualidade de sênior.
  - *Essência:* manteve **Docker no servidor próprio** (recusou Vercel) para dominar o ciclo build/deploy/manutenção, pedindo "ir devagar e entender cada passo".
  - ◆ *Padrão (build-no-CI):* o recon expôs um servidor de **512 MB RAM / 3,5 GB disco** — não builda Nuxt. Decisão: build no **CI** (Linux, resolve `sharp-linux`) → **GHCR** → servidor só faz `pull`. Servidor "burro", deploy reproduzível.
  - *Resultado:* app **no ar em https://quemfazeventos.com.br** (Cloudflare TLS → Nginx 443 → container Nitro :3000); pipeline manual validado ponta-a-ponta; CI/CD (Actions → GHCR → SSH) pronto, aguardando os 3 secrets. Imagem 269 MB · runtime ~65 MB. Ver [ADR-008](./adr/0008-deploy-docker-servidor.md).
  - *IA:* fez o recon do servidor, escreveu Dockerfile/compose/Nginx/workflows e executou instalação + deploy via SSH — sob direção e validação do Matheus.

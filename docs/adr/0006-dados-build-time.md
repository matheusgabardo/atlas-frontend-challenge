# ADR-006 — Dados em build-time, JSON commitado (reprodutível sem chave)

**Status:** Aceito · 2026-06

**Contexto:** Precisamos de ≥500 profissionais realistas, e o avaliador deve conseguir clonar e rodar (`npm install && dev/build`) **sem `.env` nem chave de API**.

**Decisão:** Um script `npm run seed` gera o dataset (Faker pt-BR + enriquecimento **opcional** com Pexels/IBGE quando há chave em `.env`). O JSON final é **commitado** no repositório. Build e dev **nunca** chamam API externa nem exigem chave; há fallback de placeholder se a chave faltar.

**Consequências:**
- ➕ Reprodutível e rápido; sem rate-limit/instabilidade em runtime; chave nunca exposta.
- ➖ Dataset versionado no repo (artefato); o enriquecimento com dados reais é um passo opcional do mantenedor.

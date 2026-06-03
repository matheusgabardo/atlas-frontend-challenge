# ADR-008 — Deploy: Docker no servidor próprio + build no CI

**Status:** Aceito · 2026-06

**Contexto:** O challenge exige solução publicada e demonstrar o ciclo build/deploy/manutenção; a revisão ([plan-review](../plan-review.md)) apontou a **entregabilidade do deploy** como o maior risco. O servidor próprio (`mgmdev`, Ubuntu 24.10, **512 MB RAM / 3,5 GB disco**) é pequeno. A app é Nuxt 4 SSR (Nitro `node-server`) e usa **sharp/ipx** (binários nativos).

**Decisão:** Containerizar com Docker e publicar no **servidor próprio** (caminho primário; Vercel recusado). **Build da imagem no CI** (GitHub Actions, Linux) → publica no **GHCR** → o servidor apenas faz `docker pull`. **Nginx** (já instalado) como reverse proxy → container em `127.0.0.1:3000`; TLS na borda (Cloudflare Origin Cert ou Certbot, decidido na etapa final).

**Consequências:**
- ➕ O servidor de 512 MB **não** builda Nuxt (OOM) — buildar no CI Linux resolve isso e gera os binários **sharp-linux** corretos (o `.dockerignore` barra o sharp-darwin local).
- ➕ Deploy **reproduzível e versionado** (imagem por SHA); servidor "burro" (só `pull` + `up`).
- ➕ `.output` auto-contido (preset node-server) → sem volume; dados em memória, read-only.
- ➕ Multi-stage `node:22-slim` (não Alpine: evita compilar libvips e estourar o disco).
- ➖ Depende de GitHub Actions + SSH no fluxo; há uma deploy key a gerir.
- ➖ Disco apertado exige `docker image prune` a cada deploy.
- **Vercel rejeitado** (decisão do usuário): controlar o ciclo completo no servidor próprio é parte do que se quer demonstrar/defender na entrevista.

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Infra & Deploy

App no ar em **https://quemfazeventos.com.br**. Entrega via **imagem Docker buildada no CI → GHCR → deploy por SSH → Nginx (reverse proxy) → Cloudflare (TLS)**. Decisões e trade-offs em [docs/adr/0008](docs/adr/0008-deploy-docker-servidor.md).

```
git push main → GitHub Actions
  ├─ CI (ci.yml): lint · typecheck · test · build
  └─ Deploy (deploy.yml): docker build (Linux) → push GHCR → ssh mgmdev
                          → docker compose pull/up → smoke test /api/health
                                        ↓
browser → Cloudflare (TLS) → Nginx :443 → container Nuxt/Nitro :3000
```

### Rodar com Docker (local)
```bash
docker build -t quemfazeventos:local .
docker run --rm -p 3000:3000 quemfazeventos:local
# http://localhost:3000  ·  http://localhost:3000/api/health
```

### Produção
- **Imagem:** `Dockerfile` multi-stage (`node:22-slim`) — ~269 MB, runtime ~65 MB RAM. Build **no CI** (o servidor de 512 MB não builda Nuxt; o CI Linux ainda resolve o `sharp-linux` correto).
- **Servidor:** `docker-compose.yml` em `/opt/quemfazeventos` puxa a imagem do GHCR e expõe `127.0.0.1:3000`; **Nginx** (`deploy/nginx/quemfazeventos.conf`) faz o proxy 80/443 → 3000.
- **CI/CD:** workflows em `.github/workflows/`. Secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY` (GHCR via `GITHUB_TOKEN`).
- **TLS:** Cloudflare (modo *Full*) + cert self-signed na origem; migração recomendada para *Cloudflare Origin Certificate* (Full Strict).

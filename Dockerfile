# syntax=docker/dockerfile:1

##
## QuemFaz Eventos — imagem de produção do app Nuxt (Nitro node-server).
## Multi-stage: "builder" compila; "runner" carrega só o bundle .output.
##

# ---------- 1) build ----------
# Debian slim (NÃO Alpine): sharp/ipx (@nuxt/image) têm binários prebuilt p/ glibc.
# No Alpine teríamos de compilar libvips — mais lento e pesado no disco.
FROM node:22-slim AS builder
WORKDIR /app

# Camada de dependências: só muda quando package*.json muda (cache eficiente).
COPY package.json package-lock.json ./
RUN npm ci

# Código-fonte + build. O .dockerignore impede que .output/.nuxt/node_modules
# locais (com o sharp do macOS) entrem — o build aqui dentro gera binários Linux.
COPY . .
RUN npm run build

# ---------- 2) runtime ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NITRO_PORT=3000 \
    NITRO_HOST=0.0.0.0

# O preset node-server gera um .output auto-contido (server + node_modules de
# runtime + assets + dados bundled). É só isso que precisa rodar em produção.
COPY --from=builder --chown=node:node /app/.output ./.output

# Roda sem privilégios (usuário "node" já existe na imagem oficial).
USER node

EXPOSE 3000

# Liveness com o fetch nativo do Node 22 (sem precisar de curl na imagem slim).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

LABEL org.opencontainers.image.source="https://github.com/matheusgabardo/atlas-frontend-challenge" \
      org.opencontainers.image.title="QuemFaz Eventos" \
      org.opencontainers.image.description="Catálogo de fornecedores de estrutura técnica para eventos (Nuxt 4 SSR)."

CMD ["node", ".output/server/index.mjs"]

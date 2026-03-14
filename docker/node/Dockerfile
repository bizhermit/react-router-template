FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN rm -rf \
  .devcontainer \
  scripts \
  src \
  .react-router \
  node_modules

FROM node:24-bookworm-slim AS runner-dep

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update -y \
  # && apt-get upgrade -y \
  # && apt-get install -y --no-install-recommends bash \
  && apt-get -y clean \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/docker/.env ./docker/.env
COPY --from=builder /app/docker/wait-for-it.sh ./docker/wait-for-it.sh
COPY --from=builder /app/docker/start.sh ./docker/start.sh
COPY --from=builder /app/docker/migrate.mjs ./docker/migrate.mjs
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=runner-dep /app/node_modules ./node_modules
COPY --from=builder /app/.artifacts/build ./.artifacts/build

USER node

CMD ["sh", "./docker/start.sh"]

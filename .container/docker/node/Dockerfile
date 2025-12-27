FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN rm -rf \
  .vscode \
  .devcontainer \
  scripts \
  playwright \
  app \
  .react-router \
  node_modules

FROM node:24-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update -y \
  # && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends openssl \
  && apt-get -y clean \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/wait-for-it.sh ./wait-for-it.sh
COPY --from=builder /app/.container/start.sh ./start.sh
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/public ./public
COPY --from=builder /app/build ./build

COPY package*.json ./
RUN npm ci --omit=dev

CMD ["sh", "./start.sh"]

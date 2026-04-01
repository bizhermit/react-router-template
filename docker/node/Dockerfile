FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/app/package.json ./packages/app/package.json
# packages/test のスタブを作成することでテスト・Storybook 依存をインストールしない
RUN mkdir -p packages/test && \
  echo '{"name":"web-app-template-test","private":true,"version":"0.0.0"}' > packages/test/package.json
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build
RUN npm run build:scripts

FROM node:24-bookworm-slim AS runner-dep

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:24-bookworm-slim AS runner

WORKDIR /app

# RUN apt-get update -y \
#   && apt-get upgrade -y \
#   # && apt-get install -y --no-install-recommends bash \
#   && apt-get -y clean \
#   && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/scripts/wait-for-it.sh ./scripts/wait-for-it.sh
COPY --from=builder /app/scripts/start.sh ./scripts/start.sh
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=runner-dep /app/node_modules ./node_modules
COPY --from=builder /app/.artifacts/scripts ./.artifacts/scripts
COPY --from=builder /app/.artifacts/build ./.artifacts/build

USER node

CMD ["sh", "./scripts/start.sh"]

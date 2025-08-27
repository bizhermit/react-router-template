FROM node:22-bookworm-slim AS builder

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

FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update -y \
  # && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends openssl \
  && apt-get -y clean \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev \
  && npm install prisma --no-save

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/build ./build
COPY --from=builder /app/.container/wait-for-it.sh ./wait-for-it.sh
COPY --from=builder /app/.container/start.sh ./start.sh

CMD ["sh", "./start.sh"]

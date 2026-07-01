FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate && npx prisma migrate deploy && npm run db:seed && npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/dev.db"
RUN mkdir -p /data
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/data ./data
COPY --from=builder /app/dev.db /data/dev.db
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/@prisma/adapter-better-sqlite3 ./node_modules/@prisma/adapter-better-sqlite3
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]

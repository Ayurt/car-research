FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --include=dev --no-audit --no-fund --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
COPY data ./data
COPY public ./public
COPY src ./src
COPY next.config.ts tsconfig.json postcss.config.mjs ./
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate \
 && npx prisma migrate deploy \
 && npm run db:seed \
 && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN mkdir -p /data
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./docker-entrypoint.sh"]

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install deps only — skip postinstall (prisma schema not copied yet)
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
ENV DATABASE_URL="file:/data/dev.db"
RUN mkdir -p /data
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/data ./data
COPY --from=builder /app/dev.db ./seed.db
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=builder /app/node_modules/prebuild-install ./node_modules/prebuild-install

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "if [ ! -f /data/dev.db ]; then cp ./seed.db /data/dev.db; fi && node server.js"]

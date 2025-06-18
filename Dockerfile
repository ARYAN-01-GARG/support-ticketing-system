# Improved Server Dockerfile with slimmer production image
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY . .
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./
EXPOSE 3000
CMD ["sh", "-c", "npx prisma generate && node dist/server.js"]

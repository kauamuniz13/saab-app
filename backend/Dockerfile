# ── Stage 1: Build do Frontend ──
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

# API relativa (servido pelo mesmo servidor)
ENV VITE_API_URL=/
RUN npm run build

# ── Stage 2: Backend + Frontend estático ──
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Dependências primeiro (cache layer)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Schema Prisma e geração do client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Código fonte backend
COPY backend/ .

# Copiar build do frontend para public/
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 3000

# Ao arrancar: aplica migrações pendentes e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node server.js"]

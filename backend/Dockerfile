FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/ .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
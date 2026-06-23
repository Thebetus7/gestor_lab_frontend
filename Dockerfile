# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app

# Limitar memoria de Node durante el build (útil en t2.micro con 1 GB RAM)
ENV NODE_OPTIONS="--max-old-space-size=768"

COPY package*.json ./
# npm ci usa package-lock.json y evita sorpresas al actualizar paquetes
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Etapa 2: Servidor de Producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
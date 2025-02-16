# Etapa 1: Construcción
FROM node:18-alpine AS builder

# Establecer la variable de entorno para producción
ENV NODE_ENV=production

# Crear el directorio de trabajo
WORKDIR /app

# Configurar npm para evitar problemas de dependencias heredadas
RUN npm config set legacy-peer-deps true

# Copiar los archivos necesarios
COPY package.json yarn.lock ./
COPY . .

# Instalar las dependencias y construir la aplicación de Next.js
RUN yarn install --frozen-lockfile

# Eliminar caché de Next.js para evitar problemas de cache
RUN rm -rf .next

RUN yarn build

# Etapa 2: Servir la aplicación con Next.js
FROM node:18-alpine AS runner

# Crear el directorio de trabajo
WORKDIR /app

# Establecer la variable de entorno de producción
ENV NODE_ENV=production

# Copiar solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

# Crear y usar un usuario no root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
ENV PORT=4200

# Cambiar al usuario no root
USER nextjs

# Exponer el puerto en el que se ejecutará la aplicación
EXPOSE 3000
# Iniciar la aplicación Next.js en modo producción
CMD ["npm", "start"]

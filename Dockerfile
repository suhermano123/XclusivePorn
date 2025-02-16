# Fase de construcción
FROM node:18 AS build

WORKDIR /app

# Copiar los archivos package.json y package-lock.json antes de instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Fase de producción
FROM node:18 AS production

WORKDIR /app

# Copiar los archivos de la fase de construcción
COPY --from=build /app/package*.json ./
COPY --from=builder /app/package.json ./
COPY --from=build /app/.next ./
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# Instalar solo las dependencias de producción
RUN npm install --only=production

EXPOSE 3000

# Iniciar la aplicación Next.js en modo producción
CMD ["npm", "start"]

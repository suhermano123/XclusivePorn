# Fase de construcción
FROM node:18 AS build

WORKDIR /app

# Copiar el package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todos los archivos
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Fase de producción
FROM node:18 AS production

WORKDIR /app

# Copiar los archivos de la fase de construcción
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./
COPY --from=build /app/public ./public

# Instalar solo las dependencias de producción
RUN npm install --only=production

# Exponer el puerto 3000
EXPOSE 3000

# Iniciar la aplicación Next.js en modo producción
CMD ["npm", "start"]

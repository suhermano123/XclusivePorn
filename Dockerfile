# Fase de construcción
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Fase de producción
FROM node:18 AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./
COPY --from=build /app/public ./public

RUN npm install --only=production

EXPOSE 3000

# Iniciar la aplicación Next.js en modo producción
CMD ["npm", "start"]

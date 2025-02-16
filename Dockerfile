# Fase de construcción
FROM node:18 AS build   # Asegúrate de que el espacio y los dos puntos estén presentes

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el package.json y package-lock.json (o yarn.lock) para instalar dependencias
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Fase de producción
FROM node:18 AS production   # Asegúrate de que el espacio y los dos puntos estén presentes

# Establecer el directorio de trabajo para producción
WORKDIR /app

# Copiar solo los archivos necesarios para producción
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./
COPY --from=build /app/public ./public

# Instalar solo las dependencias de producción
RUN npm install --only=production

# Exponer el puerto 3000 para que Next.js corra
EXPOSE 3000

# Iniciar la aplicación Next.js en modo producción
CMD ["npm", "start"]

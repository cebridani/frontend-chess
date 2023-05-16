# Imagen base oficial de Node.js
FROM node:lts-alpine as build-stage

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Construir la aplicación
RUN npm run build

# Imagen base para el servidor Nginx
FROM nginx:stable-alpine as production-stage

# Copiar la carpeta dist generada en el paso anterior
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Iniciar el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]

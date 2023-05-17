# Imagen base
FROM node:lts-alpine

# Directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el código de la aplicación
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Exponer el puerto 8080
EXPOSE 8080

# Inicia la aplicación
CMD [ "npm", "start" ]

# Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN npm rebuild

COPY . .

EXPOSE 4321

# Este CMD es el que se ejecuta si no especificas otro en docker-compose.yml
# Puedes usarlo como un fallback o como el comando principal para desarrollo.
CMD ["npx", "astro", "dev"] 
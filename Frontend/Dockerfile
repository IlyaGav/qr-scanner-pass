# Сборка frontend'а
FROM node:14-alpine as builder
ARG NODEENV
WORKDIR /home/node/app

COPY ./package.json ./package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Финальный контейнер
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types
COPY --from=builder /home/node/app/dist /app
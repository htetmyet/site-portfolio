# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ARG VITE_GEMINI_API_KEY

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine AS production

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 2323

CMD ["nginx", "-g", "daemon off;"]

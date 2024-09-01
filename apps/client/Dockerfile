FROM node:lts-alpine AS build
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx nx build client --configuration=production

FROM nginx:stable-alpine

ARG GITHUB_SHA
ARG BUILD_DATE
ARG GITHUB_REF_NAME
LABEL org.opencontainers.image.title="R&D Platform Client"
LABEL org.opencontainers.image.source="https://github.com/JuribaDev/rnd-platform"
LABEL org.opencontainers.image.revision=${GITHUB_SHA}
LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.version=${GITHUB_REF_NAME}
LABEL maintainer="Juriba Saleh juribaSaleh@gmail.com"

COPY --from=build /app/dist/apps/client /usr/share/nginx/html

COPY apps/client/nginx.conf /etc/nginx/nginx.conf

RUN apk add --no-cache gettext

COPY apps/client/env.sh /docker-entrypoint.d/40-env.sh

RUN chmod +x /docker-entrypoint.d/40-env.sh

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

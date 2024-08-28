FROM node:lts-alpine3.20 AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx nx build server --prod

FROM node:lts-alpine3.20

ARG GITHUB_SHA
ARG BUILD_DATE
ARG GITHUB_REF_NAME

LABEL org.opencontainers.image.title="R&D Platform"
LABEL org.opencontainers.image.source="https://github.com/JuribaDev/rnd-platform"
LABEL org.opencontainers.image.revision=${GITHUB_SHA}
LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.version=${GITHUB_REF_NAME}
LABEL maintainer="Juriba Saleh juribaSaleh@gmail.com"

RUN apk add --no-cache dumb-init python3 make g++

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm rebuild bcrypt --build-from-source

COPY --from=build /app/dist ./dist

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["dumb-init", "node", "dist/apps/server/main.js"]

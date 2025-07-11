############## Development Stage ##############
FROM node:22-alpine AS dev
WORKDIR /usr/app

LABEL Maintainer="Mohammad Hosseini <mimhe1381@gmail.com>"

COPY package*.json ./

RUN npm ci && \
    npm install -g @nestjs/cli && \
    npm cache clean --force

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

############## Build Stage ##############
FROM node:22-alpine AS build
WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build && \
    npm prune --production

############## Production Dependencies Stage ##############
FROM node:22-alpine AS prod-deps
WORKDIR /usr/app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf ~/.npm

############## Test Stage ##############
# Soon

############## Runtime Stage ##############
FROM node:22-alpine AS runtime

WORKDIR /usr/app

COPY --from=build /usr/app/dist ./dist
COPY --from=prod-deps /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/package.json ./

USER nestjs

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

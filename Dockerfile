FROM node:20-alpine AS base
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml ./
COPY client/package.json client/pnpm-lock.yaml ./client/
RUN pnpm install
WORKDIR /app/client
RUN pnpm install
WORKDIR /app
COPY . .
RUN pnpm run build

FROM node:20-alpine AS release
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

EXPOSE 5174
CMD ["pnpm", "start"]

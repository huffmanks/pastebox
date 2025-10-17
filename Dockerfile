FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY server.ts ./server.ts
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "server.ts"]

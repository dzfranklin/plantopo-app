FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build && \
    npx vite build --config vite.worker.config.ts

FROM node:20-alpine
COPY ./package.json package-lock.json server.js worker.js entrypoint.sh drizzle.config.ts /app/
COPY ./drizzle /app/drizzle
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
RUN chmod +x /app/entrypoint.sh
ENV NODE_ENV=production
ENTRYPOINT ["/app/entrypoint.sh"]

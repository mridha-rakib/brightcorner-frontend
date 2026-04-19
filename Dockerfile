# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=bright-corner-web-npm,target=/root/.npm \
    npm ci --no-audit --no-fund

FROM deps AS build

ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ARG INTERNAL_API_URL=http://api:3001/api/v1
ARG BUILD_NODE_OPTIONS=--max-old-space-size=1024

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
ENV NODE_OPTIONS=${BUILD_NODE_OPTIONS}

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]

# syntax = docker/dockerfile:1

# Node runs src/server.ts directly (its native TypeScript type-stripping),
# so there's no build step: install production dependencies, copy the
# source, run it. Serves HTTP on 0.0.0.0:$PORT (fly.toml sets PORT) and
# publishes README.md at /readme/ (spec/README.md says what's checked).

FROM docker.io/library/node:24.21.0-slim

WORKDIR /app
ENV DB_PATH=/data/trace.db

COPY package.json pnpm-lock.yaml ./
RUN npm install --omit=dev --ignore-scripts

COPY src/ src/
COPY public/ public/
COPY README.md ./

EXPOSE 8080
CMD ["node", "src/server.ts"]

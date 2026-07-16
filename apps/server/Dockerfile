# Build from the repository root:
#   docker build -f apps/server/Dockerfile .
FROM node:24-slim AS base
RUN corepack enable pnpm
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/server/package.json apps/server/package.json
# postinstall runs prepare-prisma + prisma generate, so it needs these:
COPY apps/server/scripts apps/server/scripts
COPY apps/server/prisma apps/server/prisma
COPY apps/server/prisma.config.ts apps/server/prisma.config.ts
RUN pnpm install --frozen-lockfile --filter @feedback-mcp/server

FROM deps AS build
COPY apps/server apps/server
WORKDIR /repo/apps/server
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
COPY --from=build /repo /repo
WORKDIR /repo/apps/server
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]

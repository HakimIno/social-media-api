ARG BUN_VERSION=1.1.18
FROM oven/bun:${BUN_VERSION}-slim as base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

FROM base as build
# Install dependencies
COPY --link bun.lockb package.json ./
RUN bun install --ci

RUN bun add prisma

COPY --link . .

COPY --link app/src/prisma ./prisma

RUN bun prisma migrate deploy
RUN bun prisma generate

FROM base

COPY --from=build /app /app

EXPOSE 8888

ENTRYPOINT ["bun", "run"]

CMD ["dev"]

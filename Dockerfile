ARG BUN_VERSION=1.1.18
FROM oven/bun:${BUN_VERSION}-slim as base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

# Set NODE_ENV to development by default
ENV NODE_ENV="development"

FROM base as build

# Install dependencies
COPY --link bun.lockb package.json ./
RUN bun install --ci

# Install Prisma CLI
RUN bun add prisma

# Copy application code
COPY --link . .

# Copy Prisma schema and migrations
COPY --link app/src/prisma ./prisma

# Run Prisma migration and generate
RUN bun prisma migrate deploy
RUN bun prisma generate

FROM base

# Copy build artifacts to final image
COPY --from=build /app /app

EXPOSE 8888

# Set NODE_ENV to production
ENV NODE_ENV="production"

# Set default executable with ENTRYPOINT
ENTRYPOINT ["bun", "run"]

# Override CMD for development
CMD ["dev"]

# Default CMD for production
# CMD ["start"]  # Commented out to avoid conflict, use ENTRYPOINT instead
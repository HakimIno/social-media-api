# ARG BUN_VERSION=1.1.18
# FROM oven/bun:${BUN_VERSION}-slim as base

# LABEL fly_launch_runtime="Bun"

# WORKDIR /app

# # Set NODE_ENV to development by default
# ENV NODE_ENV="development"

# FROM base as build

# # Install dependencies
# COPY --link bun.lockb package.json ./
# RUN bun install --ci

# # Install Prisma CLI
# RUN bun add prisma

# # Copy application code
# COPY --link . .

# # Copy Prisma schema and migrations
# COPY --link app/src/prisma ./prisma

# # Run Prisma migration and generate
# RUN bun prisma migrate deploy
# RUN bun prisma generate

# FROM base

# # Copy build artifacts to final image
# COPY --from=build /app /app

# EXPOSE 8888

# # Set NODE_ENV to production
# ENV NODE_ENV="production"

# # Set default executable with ENTRYPOINT
# ENTRYPOINT ["bun", "run"]

# # Override CMD for development
# CMD ["dev"]

# Base image with Bun
ARG BUN_VERSION=1.1.18
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

# Set environment variable for development
ENV NODE_ENV="development"

# Build stage
FROM base AS build

# Install dependencies
COPY --link bun.lockb package.json ./
RUN bun install --ci

# Install Prisma CLI as development dependency
RUN bun add -D prisma

# Copy application code
COPY --link . .

# Copy Prisma schema and migrations
COPY --link app/src/prisma ./prisma

# Run Prisma migration and generate
RUN bun prisma migrate deploy
RUN bun prisma generate

# Final stage with Nginx setup
FROM base

# Install Nginx
RUN apt-get update && apt-get install -y nginx

# Create log and PID directories with correct permissions
RUN mkdir -p /var/log/nginx /run/nginx && \
    chown -R www-data:www-data /var/log/nginx /run/nginx

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build artifacts from the build stage
COPY --from=build /app /app

# Expose ports for the application and Nginx
EXPOSE 8888
EXPOSE 80

# Set environment variable for production
ENV NODE_ENV="production"

# Start Nginx and the Bun application
CMD ["sh", "-c", "nginx -g 'daemon off;' & bun run dev"]

# # Define the Bun version to use
# ARG BUN_VERSION=1.1.18

# # Use the Bun base image
# FROM oven/bun:${BUN_VERSION}-slim AS base

# LABEL fly_launch_runtime="Bun"

# # Set the working directory
# WORKDIR /app

# # Set default NODE_ENV to development
# ENV NODE_ENV=development

# # Define a build stage
# FROM base AS build

# # Copy package files and install dependencies
# COPY bun.lockb package.json ./
# RUN bun install --ci

# # Install Prisma CLI
# RUN bun add prisma

# # Copy application code and Prisma files
# COPY . .
# COPY app/src/prisma ./prisma


# # Run Prisma migrations and generate client
# RUN bun prisma migrate deploy
# RUN bun prisma generate

# # Define the final stage
# FROM base

# # Copy the build artifacts from the build stage
# COPY --from=build /app /app

# # Set the working directory
# WORKDIR /app

# # Expose the port on which the application will run
# EXPOSE 8888

# # Set NODE_ENV to production for the final image
# ENV NODE_ENV=production

# # Set the default executable
# ENTRYPOINT ["bun", "run"]

# # Override the default command with a development script
# CMD ["dev"]



ARG BUN_VERSION=1.1.18
FROM oven/bun:${BUN_VERSION}-slim AS base
LABEL fly_launch_runtime="Bun"
WORKDIR /app
ENV NODE_ENV=development
FROM base AS build
COPY bun.lockb package.json ./
RUN bun install --ci
COPY . .
FROM base
COPY --from=build /app /app
WORKDIR /app
EXPOSE 8888
ENV NODE_ENV=production
ENTRYPOINT ["bun", "run"]
CMD ["dev"]

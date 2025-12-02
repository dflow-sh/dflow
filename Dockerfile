# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.mjs file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# Updated for Turborepo monorepo structure

FROM node:22.12.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g corepack@latest && corepack enable && corepack prepare pnpm@10.2.0 --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy package.json files for all workspaces
COPY apps/web/package.json ./apps/web/package.json
COPY packages/core/package.json ./packages/core/package.json

# Install dependencies
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g corepack@latest && corepack enable && corepack prepare pnpm@10.2.0 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/web ./apps/web
COPY packages/core ./packages/core

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_WEBSITE_URL
ARG DATABASE_URI
ARG REDIS_URI
ARG PAYLOAD_SECRET
ARG TAILSCALE_AUTH_KEY
ARG TAILSCALE_OAUTH_CLIENT_SECRET
ARG TAILSCALE_TAILNET
ARG NEXT_PUBLIC_PROXY_DOMAIN_URL
ARG NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN
ARG NEXT_PUBLIC_BETTER_STACK_INGESTING_URL
ARG RESEND_API_KEY
ARG RESEND_SENDER_EMAIL
ARG RESEND_SENDER_NAME
ARG NEXT_PUBLIC_PROXY_CNAME
ARG NEXT_PUBLIC_DISCORD_INVITE_URL
ARG SKIP_VALIDATION
ARG BESZEL_MONITORING_URL
ARG BESZEL_SUPERUSER_EMAIL
ARG BESZEL_SUPERUSER_PASSWORD
ARG BESZEL_HUB_SSH_KEY
ARG S3_ENDPOINT
ARG S3_REGION
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY

ENV NEXT_PUBLIC_WEBSITE_URL=__NEXT_PUBLIC_WEBSITE_URL__
ENV NEXT_PUBLIC_PROXY_CNAME=__NEXT_PUBLIC_PROXY_CNAME__
ENV NEXT_PUBLIC_DISCORD_INVITE_URL=__NEXT_PUBLIC_DISCORD_INVITE_URL__
ENV NEXT_PUBLIC_PROXY_DOMAIN_URL=__NEXT_PUBLIC_PROXY_DOMAIN_URL__
ENV NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN=__NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN__
ENV NEXT_PUBLIC_BETTER_STACK_INGESTING_URL="https://s1.eu.betterstackdata.com"
ENV DATABASE_URI=$DATABASE_URI
ENV REDIS_URI=$REDIS_URI
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV TAILSCALE_AUTH_KEY=$TAILSCALE_AUTH_KEY
ENV TAILSCALE_OAUTH_CLIENT_SECRET=$TAILSCALE_OAUTH_CLIENT_SECRET
ENV TAILSCALE_TAILNET=$TAILSCALE_TAILNET
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV RESEND_SENDER_EMAIL=$RESEND_SENDER_EMAIL
ENV RESEND_SENDER_NAME=$RESEND_SENDER_NAME
ENV SKIP_VALIDATION=$SKIP_VALIDATION
ENV BESZEL_MONITORING_URL=$BESZEL_MONITORING_URL
ENV BESZEL_SUPERUSER_EMAIL=$BESZEL_SUPERUSER_EMAIL
ENV BESZEL_SUPERUSER_PASSWORD=$BESZEL_SUPERUSER_PASSWORD
ENV BESZEL_HUB_SSH_KEY=$BESZEL_HUB_SSH_KEY
ENV PORT=3000
ENV S3_ENDPOINT=$S3_ENDPOINT
ENV S3_REGION=$S3_REGION
ENV S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
ENV S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY

# Build with Turborepo
RUN pnpm build --filter=@dflow/web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN apk add --no-cache openssh-client

# RUN mkdir -p /var/run/tailscale /var/lib/tailscale && chmod 777 /var/run/tailscale /var/lib/tailscale

RUN apk add --no-cache tailscale

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER root

EXPOSE 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["/app/entrypoint.sh"]

# Docker Build Guide

## Quick Start

### Option 1: Simple Build (Recommended)

The Dockerfile automatically sets `SKIP_VALIDATION=1` to skip environment validation during build:

```bash
docker build -t dflow:latest .
```

Environment variables will be validated at **runtime** when you start the container.

### Option 2: Build with docker-compose

```bash
docker-compose build
```

## Running the Container

### With docker-compose (Recommended)

1. Make sure your `.env` file or `docker-compose.yml` has all required environment variables
2. Run:

```bash
docker-compose up -d
```

### With docker run

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URI=mongodb://user:pass@host:port/db \
  -e REDIS_URI=redis://host:port \
  -e PAYLOAD_SECRET=your-secret \
  -e NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000 \
  dflow:latest
```

## Required Environment Variables

At **runtime** (not build time), you must provide:

- `DATABASE_URI` - MongoDB connection string
- `REDIS_URI` - Redis connection string  
- `PAYLOAD_SECRET` - Secret key for Payload CMS
- `NEXT_PUBLIC_WEBSITE_URL` - Public URL of your application

See [.env.example](.env.example) for all available environment variables.

## How It Works

### Build Time
- `SKIP_VALIDATION=1` is set automatically in the Dockerfile
- This tells `packages/core/src/env.ts` to skip environment validation
- The build completes without requiring actual environment values

### Runtime
- Environment variables are provided via `docker-compose.yml` or `docker run -e`
- The `env.ts` validation runs and checks all required variables
- Application starts with validated environment

## Troubleshooting

### Build fails with "Invalid environment variables"

**Problem:** The Dockerfile isn't setting `SKIP_VALIDATION=1` properly.

**Solution:** Make sure you're using the latest Dockerfile. The line should be:
```dockerfile
ENV SKIP_VALIDATION=${SKIP_VALIDATION:-1}
```

This sets `SKIP_VALIDATION=1` by default if not provided as a build arg.

### Runtime fails with "Invalid environment variables"

**Problem:** Required environment variables are missing at runtime.

**Solution:** Check that your `docker-compose.yml` or `docker run` command includes:
- DATABASE_URI
- REDIS_URI
- PAYLOAD_SECRET
- NEXT_PUBLIC_WEBSITE_URL

## File Locations

- **Dockerfile**: `/Dockerfile` (root)
- **docker-compose.yml**: `/docker-compose.yml` (root)
- **.env for local dev**: `/apps/web/.env`
- **.env for docker-compose**: `/.env` (root, loaded by docker-compose)
- **env validation**: `/packages/core/src/env.ts`

## Monorepo Structure

The Dockerfile is optimized for the Turborepo monorepo:

1. Copies workspace configuration
2. Installs dependencies for all packages
3. Copies source code for `apps/web` and `packages/core`
4. Builds only `@dflow/web` using Turborepo
5. Creates standalone Next.js build

## Notes

- **fsevents warnings**: These are expected on Alpine Linux and can be ignored
- **Build args**: You don't need to pass build args unless you want to override `SKIP_VALIDATION`
- **Security**: Sensitive values should be provided at runtime, not baked into the image

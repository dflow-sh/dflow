# dFlow Monorepo Documentation

## Overview

dFlow is organized as a **Turborepo monorepo** with a clear separation between the application and shared code. This structure enables better code organization, improved build performance, and easier dependency management.

## Repository Structure

```
dflow/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/           # Next.js app router pages
│       │   ├── middleware.ts  # Next.js middleware
│       │   └── payload.config.ts  # Payload CMS config proxy
│       ├── public/            # Static assets
│       ├── .env               # Environment variables (gitignored)
│       ├── package.json       # App dependencies
│       ├── tsconfig.json      # TypeScript config
│       └── next.config.ts     # Next.js config
│
├── packages/
│   └── core/                   # Shared core package
│       ├── src/
│       │   ├── actions/       # Server actions
│       │   ├── components/    # React components
│       │   ├── lib/           # Utility functions
│       │   ├── hooks/         # React hooks
│       │   ├── providers/     # Context providers
│       │   ├── queues/        # BullMQ queue handlers
│       │   ├── payload/       # Payload CMS collections & config
│       │   ├── plugins/       # Custom plugins
│       │   ├── stores/        # State management
│       │   ├── styles/        # Shared styles
│       │   ├── env.ts         # Environment validation (Zod)
│       │   ├── payload.config.ts  # Payload CMS configuration
│       │   ├── payload-types.ts   # Generated Payload types
│       │   └── index.ts       # Package entry point
│       ├── package.json       # Core package config
│       └── tsconfig.json      # TypeScript config
│
├── package.json               # Root workspace configuration
├── pnpm-workspace.yaml        # PNPM workspace definition
├── turbo.json                 # Turborepo pipeline configuration
├── .gitignore                 # Git ignore patterns
└── .prettierignore            # Prettier ignore patterns
```

## Package Architecture

### apps/web

The **web** package contains the Next.js application that serves the dFlow UI. It depends on `@dflow/core` for all shared functionality.

**Key Features:**
- Next.js 15 with App Router
- Server-side rendering (SSR)
- API routes
- Payload CMS admin UI integration
- Environment variable validation

### packages/core

The **core** package contains all shared code used across the application.

**Key Modules:**
- **actions/**: Server actions for data mutations
- **components/**: Reusable React components
- **lib/**: Utility functions, helpers, and integrations
- **hooks/**: Custom React hooks
- **providers/**: Context providers for state management
- **queues/**: BullMQ job queue handlers
- **payload/**: Payload CMS collections, fields, and hooks
- **plugins/**: Custom Payload CMS plugins

## Getting Started

### Prerequisites

- **Node.js**: v18.20.2 or >=20.9.0
- **pnpm**: 10.24.0 (specified in `packageManager` field)

### Installation

```bash
# Install dependencies
pnpm install
```

## Package Management

### Adding Dependencies

**To a specific workspace (e.g., web app):**
```bash
pnpm add [package-name] --filter @dflow/web
# or using short flag
pnpm add [package-name] -F @dflow/web
```

**To the core package:**
```bash
pnpm add [package-name] -F @dflow/core
```

**To the root workspace (dev tools, etc.):**
```bash
pnpm add [package-name] -w
# or
pnpm add [package-name] --workspace-root
```

**Adding Dev Dependencies:**
```bash
pnpm add -D [package-name] -F @dflow/web
```

### Removing Dependencies

```bash
pnpm remove [package-name] -F @dflow/web
```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update -r

# Update specific package
pnpm update [package-name] -F @dflow/web
```

## Environment Setup

1.  **Copy the environment file** to `apps/web/`:
    ```bash
    # Create a symlink (Recommended for local dev)
    ln -s ../../.env apps/web/.env
    
    # OR copy the file
    cp .env apps/web/.env
    ```

2.  **Configure required variables** in `.env` (root):
    ```env
    # Required
    DATABASE_URI=mongodb://localhost:27017/dflow
    PAYLOAD_SECRET=your-secret-key
    REDIS_URI=redis://localhost:6379
    NEXT_PUBLIC_WEBSITE_URL=localhost:3000
    
    # Optional (for email)
    RESEND_API_KEY=
    RESEND_SENDER_EMAIL=
    RESEND_SENDER_NAME=
    
    # Optional (for Tailscale integration)
    TAILSCALE_OAUTH_CLIENT_SECRET=
    TAILSCALE_TAILNET=
    TAILSCALE_AUTH_KEY=
    
    # Optional (for monitoring)
    BESZEL_MONITORING_URL=
    BESZEL_SUPERUSER_EMAIL=
    BESZEL_SUPERUSER_PASSWORD=
    ```

> [!IMPORTANT]
> For local development (`pnpm dev`), Next.js looks for `.env` in `apps/web/`. Since we moved `.env` to the root, a symlink is the best way to keep them in sync.

## Development

### Running the Development Server

```bash
# Start all packages in development mode
pnpm dev

# Or run specific package
pnpm --filter web dev
```

The application will be available at `http://localhost:3000`.

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter web build
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm --filter web lint
```

### Type Checking

```bash
# Type check in core package
pnpm --filter @dflow/core type-check
```

## Import Patterns

### Importing from @dflow/core

All shared code should be imported using the `@dflow/core/*` pattern:

```typescript
// ✅ Correct
import { Button } from '@dflow/core/components/ui/button'
import { getCurrentUser } from '@dflow/core/lib/getCurrentUser'
import { env } from '@dflow/core/env'
import type { Service } from '@dflow/core/payload-types'

// ❌ Incorrect (old pattern, no longer works)
import { Button } from '@/components/ui/button'
```

### Importing within apps/web

For app-specific code (like app routes), use the `@/` alias:

```typescript
// In apps/web/src/app/...
import { AuthConfig } from '@dflow/core/payload-types'
import SomeComponent from '@/app/components/SomeComponent'
```

## Turborepo Configuration

### Pipeline Tasks

Defined in [`turbo.json`](file:///Users/manikanta/dev/github/dflow-sh/dflow/turbo.json):

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Task Execution:**
- `build`: Builds packages in dependency order
- `lint`: Runs linting across all packages
- `dev`: Starts development servers (no caching)

### Caching

Turborepo automatically caches build outputs to speed up subsequent builds. Cache is stored in:
- Local: `.turbo/` (gitignored)
- Remote: Disabled by default

## Adding New Packages

### 1. Create Package Structure

```bash
mkdir -p packages/new-package/src
cd packages/new-package
```

### 2. Create package.json

```json
{
  "name": "@dflow/new-package",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@dflow/new-package/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### 4. Update Workspace

The package will be automatically detected by pnpm workspace (defined in `pnpm-workspace.yaml`).

## Common Tasks

### Generating Payload Types

```bash
pnpm --filter web generate:types
```

This generates TypeScript types from your Payload CMS schema to `packages/core/src/payload-types.ts`.

### Running Database Migrations

```bash
pnpm --filter web migrate:beszel
```

### Cleaning Build Artifacts

```bash
# Remove all build artifacts and caches
rm -rf apps/web/.next
rm -rf .turbo
rm -rf node_modules
pnpm install
```

## Troubleshooting

### Build Fails with "Cannot find module '@dflow/core/...'"

**Solution:** Ensure TypeScript path mappings are configured in `apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@dflow/core/*": ["../../packages/core/src/*"]
    }
  }
}
```

### Environment Variables Not Loading

**Solution:** Ensure `.env` file is in `apps/web/`, not the root:

```bash
cp .env apps/web/.env
```

### Turborepo Cache Issues

**Solution:** Clear the Turborepo cache:

```bash
rm -rf .turbo
pnpm build --force
```

### TypeScript Errors After Adding New Files

**Solution:** Restart TypeScript server in your editor or run:

```bash
pnpm --filter web type-check
```

## Best Practices

### 1. Code Organization

- **Shared code** → `packages/core/src/`
- **App-specific code** → `apps/web/src/`
- **Types** → Co-locate with implementation or in `payload-types.ts`

### 2. Dependency Management

- Install shared dependencies in `packages/core/package.json`
- Install app-specific dependencies in `apps/web/package.json`
- Use workspace protocol for internal dependencies: `"@dflow/core": "workspace:*"`

### 3. Environment Variables

- Define validation schema in `packages/core/src/env.ts`
- Store actual values in `apps/web/.env`
- Never commit `.env` files (already in `.gitignore`)

### 4. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature
```

### 5. Performance

- Use Turborepo's caching for faster builds
- Run `pnpm build` to verify changes before pushing
- Use `pnpm dev` for hot-reloading during development

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm --filter web dev` | Start only web app |
| `pnpm --filter web build` | Build only web app |
| `pnpm --filter @dflow/core type-check` | Type check core package |

## Docker Deployment

The repository includes Docker configuration optimized for the Turborepo monorepo structure.

### Building the Docker Image

The Docker build process is optimized for the monorepo and handles environment variables automatically.

```bash
docker build -t dflow:latest .
```

**Key Features:**
- **Automatic Env Validation Skipping**: The Dockerfile sets `SKIP_VALIDATION=1` by default, so you don't need to pass secrets during the build.
- **Public Folder Handling**: Correctly copies `apps/web/public` to the runtime image.
- **Dynamic Entrypoint**: The `entrypoint.sh` script automatically detects the location of `server.js` (whether at root or in `apps/web/`), making it robust to build output changes.

### Optimized Build (Recommended)

You can use the optimized Dockerfile which uses `turbo prune` for better caching:

```bash
docker build -f Dockerfile.turbo -t dflow:latest .
```

This method is faster for repeated builds as it caches dependencies separately from source code.

### Running with Docker Compose

```bash
docker-compose up -d
```

The `docker-compose.yml` includes:
- **payload-app**: The dFlow Next.js application
- **mongodb**: MongoDB database
- **redis**: Redis for caching and queues
- **traefik**: Reverse proxy
- **beszel**: Monitoring dashboard
- **config-generator**: Dynamic configuration

### Environment Variables for Docker

Set these in your `.env` file or docker-compose environment:

```env
# Required
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_password
MONGO_DB_NAME=dflow
PAYLOAD_SECRET=your_secret_key
NEXT_PUBLIC_WEBSITE_URL=https://your-domain.com

# Optional
TAILSCALE_AUTH_KEY=
TAILSCALE_OAUTH_CLIENT_SECRET=
TAILSCALE_TAILNET=
```

### Docker Files

- **[Dockerfile](file:///Users/manikanta/dev/github/dflow-sh/dflow/Dockerfile)**: Multi-stage build for production
- **[.dockerignore](file:///Users/manikanta/dev/github/dflow-sh/dflow/.dockerignore)**: Excludes unnecessary files from build
- **[docker-compose.yml](file:///Users/manikanta/dev/github/dflow-sh/dflow/docker-compose.yml)**: Complete stack configuration
- **[scripts/entrypoint.sh](file:///Users/manikanta/dev/github/dflow-sh/dflow/scripts/entrypoint.sh)**: Container startup script

## Styles Configuration

The project uses Tailwind CSS v4 with the following setup:

### Global Styles Location

Global styles are located in `packages/core/src/styles/globals.css` and imported in the app layout:

```typescript
import '@dflow/core/styles/globals.css'
```

### Tailwind CSS v4 Source Directive

The `globals.css` file includes `@source` directives to tell Tailwind where to scan for class names:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@source '../../apps/web/src';
@source '../';

@plugin "@tailwindcss/typography";
```

> [!NOTE]
> CSS linter warnings for `@source`, `@plugin`, `@theme`, `@utility`, and `@apply` are expected. These are valid Tailwind CSS v4 directives that standard CSS linters don't recognize.

## Additional Resources


- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)

## Support

For issues or questions:
1. Check this documentation
2. Review the [walkthrough.md](file:///Users/manikanta/.gemini/antigravity/brain/028a9e73-a025-4094-b83e-720e9d93969c/walkthrough.md)
3. Open an issue on GitHub

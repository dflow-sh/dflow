# dFlow Monorepo Architecture

> **dFlow** is an open-source alternative to Railway, Heroku & Vercel - built
> with a modern monorepo architecture for maximum code reusability and developer
> experience.

## 📚 Table of Contents

- [Structure Overview](#structure-overview)
- [Package Dependencies](#package-dependencies)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Package Guide](#package-guide)
- [Architecture Decisions](#architecture-decisions)
- [Commands Reference](#commands-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

## 🏗️ Structure Overview

```

dflow/ ├── apps/ │ └── web/ # Next.js 15 application (App Router) │ ├── app/ #
Next.js pages & API routes │ ├── public/ # Static assets │ ├── next.config.ts #
Next.js configuration │ ├── tailwind.config.ts # Tailwind CSS config │ └──
package.json # App dependencies │ ├── packages/ │ ├── actions/ # Server Actions
(next-safe-action) │ │ ├── src/ │ │ │ ├── auth/ # Authentication actions │ │ │
├── server/ # Server management actions │ │ │ ├── service/ # Service deployment
actions │ │ │ ├── project/ # Project management actions │ │ │ ├── cloud/ # Cloud
provider actions (AWS, etc.) │ │ │ └── deployment/ # Deployment orchestration │
│ └── package.json │ │ │ ├── components/ # React Components │ │ ├── src/ │ │ │
├── ui/ # shadcn/ui components │ │ │ ├── servers/ # Server-related components │
│ │ ├── service/ # Service components │ │ │ ├── project/ # Project components │
│ │ ├── security/ # Security & SSH components │ │ │ ├── team/ # Team management
components │ │ │ ├── templates/ # Template components │ │ │ ├── onboarding/ #
Onboarding flow │ │ │ └── reactflow/ # React Flow diagrams │ │ └── package.json
│ │ │ ├── hooks/ # Custom React Hooks │ │ ├── src/ │ │ │ ├── use-mobile.tsx │ │
│ ├── use-xterm.tsx │ │ │ └── useCrossDomainAuth.ts │ │ └── package.json │ │ │
├── providers/ # React Context Providers │ │ ├── src/ │ │ │ ├── Provider.tsx #
Root provider │ │ │ ├── BrandingProvider.tsx # Theming & branding │ │ │ ├──
BubbleProvider.tsx # Floating menu │ │ │ ├── TerminalProvider.tsx # Terminal
state │ │ │ └── ServersProvider.tsx # Server context │ │ └── package.json │ │ │
├── stores/ # Zustand State Management │ │ ├── src/ │ │ │ └──
useTerminalStore.ts │ │ └── package.json │ │ │ ├── lib/ # Core Utilities &
Libraries │ │ ├── src/ │ │ │ ├── dokku/ # Dokku API client │ │ │ ├── netdata/ #
Netdata monitoring │ │ │ ├── beszel/ # Beszel monitoring │ │ │ ├── ssh.ts # SSH
utilities │ │ │ ├── redis/ # Redis client │ │ │ ├── bullmq/ # Queue
configuration │ │ │ ├── permissions/ # RBAC utilities │ │ │ └── utils.ts #
General utilities │ │ └── package.json │ │ │ ├── queue/ # BullMQ Queue Workers │
│ ├── src/ │ │ │ ├── app/ # App deployment queues │ │ │ ├── database/ # Database
queues │ │ │ ├── server/ # Server management queues │ │ │ └── workers.ts #
Worker definitions │ │ └── package.json │ │ │ ├── payload/ # Payload CMS
Configuration │ │ ├── src/ │ │ │ ├── collections/ # CMS collections (Users,
Servers, etc.) │ │ │ ├── globals/ # Global settings │ │ │ ├── access/ # Access
control │ │ │ ├── endpoints/ # Custom endpoints │ │ │ └── payload.config.ts │ │
└── package.json │ │ │ ├── emails/ # Email Templates (React Email) │ │ ├── src/
│ │ │ ├── common/ # Shared email components │ │ │ ├── magic-link/ # Magic link
email │ │ │ ├── reset-password/ │ │ │ └── team-invitation/ │ │ └── package.json
│ │ │ ├── types/ # Shared TypeScript Types │ │ ├── src/ │ │ │ ├──
payload-types.ts # Auto-generated Payload types │ │ │ └── index.ts │ │ └──
package.json │ │ │ ├── plugins/ # Payload CMS Plugins │ │ ├── src/ │ │ │ └──
webhook/ # Webhook plugin │ │ └── package.json │ │ │ ├── docs/ # Documentation
Content │ │ ├── content/ │ │ │ ├── introduction/ │ │ │ ├── onboarding/ │ │ │ ├──
security/ │ │ │ ├── servers/ │ │ │ └── services/ │ │ └── package.json │ │ │ └──
config/ # Shared Configuration │ ├── eslint/ # ESLint configs │ ├──
typescript/ # TypeScript configs │ └── package.json │ ├── scripts/ # Shell
Scripts │ ├── cloud-init.sh │ ├── install-dokku-interceptor.sh │ └──
self-host-setup.sh │ ├── pnpm-workspace.yaml # Workspace configuration ├──
turbo.json # Turborepo configuration ├── package.json # Root package (scripts &
dev deps) └── tsconfig.json # Root TypeScript config

```

## 🔗 Package Dependencies

```

graph TD A[apps/web] --> B[packages/components] A --> C[packages/actions] A -->
D[packages/providers] A --> E[packages/payload] A --> F[packages/hooks] A -->
G[packages/stores] A --> H[packages/lib] A --> I[packages/types]

    C --> H
    C --> J[packages/queue]
    C --> I

    B --> F
    B --> G
    B --> I

    D --> G
    D --> I

    E --> K[packages/emails]
    E --> I

    J --> H
    J --> I

    L[packages/plugins] --> I

    style A fill:#4f46e5,stroke:#333,stroke-width:4px,color:#fff
    style B fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#06b6d4,stroke:#333,stroke-width:2px,color:#fff
    style H fill:#10b981,stroke:#333,stroke-width:2px,color:#fff
    style I fill:#f59e0b,stroke:#333,stroke-width:2px,color:#fff

```

### Dependency Rules

1. **apps/web** can depend on any package
2. **packages/lib** and **packages/types** are foundational (no internal
   dependencies)
3. **packages/actions** depends on lib, queue, types
4. **packages/components** depends on hooks, stores, types
5. **No circular dependencies allowed**

## 🚀 Getting Started

### Prerequisites

- Node.js: `^18.20.2` or `>=20.9.0`
- pnpm: `10.2.0`

### Installation

```

# Clone the repository

git clone https://github.com/your-org/dflow.git cd dflow

# Install all dependencies

pnpm install

# Generate Payload types

pnpm generate:types

# Start development server

pnpm dev

```

### First Time Setup

1. Copy environment variables:

```

cp .env.example .env

```

2. Configure your environment (MongoDB, Redis, etc.)

3. Start development:

```

pnpm dev

```

The app will be available at `http://localhost:3000`

## 💻 Development Workflow

### Running the Development Server

```

# Start all packages in watch mode

pnpm dev

# Start only the web app

pnpm web

# Start with fresh Next.js cache

pnpm --filter @dflow/web devsafe

```

### Building for Production

```

# Build all packages

pnpm build

# Build only web app

pnpm web:build

# Start production server

pnpm start

```

### Type Checking

```

# Check all packages

pnpm type-check

# Check specific package

pnpm --filter @dflow/components type-check

```

### Linting

```

# Lint all packages

pnpm lint

# Lint specific package

pnpm --filter @dflow/web lint

```

### Adding Dependencies

#### To a specific package:

```

pnpm add axios --filter @dflow/lib pnpm add react-hook-form --filter
@dflow/components

```

#### To the web app:

```

pnpm add next-auth --filter @dflow/web

```

#### To root (dev dependencies):

```

pnpm add -Dw prettier

```

#### Removing dependencies:

```

pnpm remove axios --filter @dflow/lib

```

## 📦 Package Guide

### `apps/web` - Next.js Application

**Purpose**: Main Next.js application with App Router

**Key Files**:

- `app/` - Next.js pages, layouts, and API routes
- `next.config.ts` - Next.js configuration
- `middleware.ts` - Request middleware
- `tailwind.config.ts` - Tailwind CSS configuration

**What goes here**:

- Page components (`app/*/page.tsx`)
- Layouts (`app/*/layout.tsx`)
- API routes (`app/api/*/route.ts`)
- Next.js specific configuration
- Global styles

**What doesn't go here**:

- Reusable components (→ `packages/components`)
- Business logic (→ `packages/actions` or `packages/lib`)
- Server actions (→ `packages/actions`)

### `packages/actions` - Server Actions

**Purpose**: Type-safe server actions using next-safe-action

**Structure**:

```

actions/ ├── auth/ │ ├── index.ts # Exported actions │ └── validator.ts # Zod
schemas ├── server/ │ ├── index.ts │ └── validator.ts └── index.ts # Main export

```

**Example**:

```

// packages/actions/src/server/index.ts 'use server'

import { action } from '@dflow/lib/safe-action' import { createServerSchema }
from './validator'

export const createServerAction = action .schema(createServerSchema)
.action(async ({ parsedInput }) => { // Server-side logic return { success: true
} })

```

**Usage in app**:

```

// apps/web/app/servers/page.tsx import { createServerAction } from
'@dflow/actions/server'

const result = await createServerAction({ name: 'my-server' })

```

### `packages/components` - React Components

**Purpose**: All React components, including UI library

**Structure**:

```

components/ ├── ui/ # shadcn/ui components ├── servers/ # Domain-specific
components ├── service/ ├── project/ └── index.ts # Main exports

```

**Example**:

```

// packages/components/src/servers/ServerCard.tsx import { Button } from
'../ui/button' import type { Server } from '@dflow/types'

export function ServerCard({ server }: { server: Server }) { return (
<div className="p-4"> <h3>{server.name}</h3> <Button>Connect</Button> </div> ) }

// packages/components/src/servers/index.ts export { ServerCard } from
'./ServerCard' export { ServerList } from './ServerList'

```

**Usage**:

```

// apps/web/app/servers/page.tsx import { ServerCard, ServerList } from
'@dflow/components/servers'

```

### `packages/lib` - Core Utilities

**Purpose**: Pure TypeScript utilities, no React dependencies

**What goes here**:

- API clients (Dokku, AWS, SSH)
- Utility functions
- Configuration helpers
- Server-side only code

**Example**:

```

// packages/lib/src/dokku/apps/create.ts import { SSH } from '@dflow/lib/ssh'

export async function createDokkuApp(serverId: string, appName: string) { const
ssh = new SSH(serverId) const result = await
ssh.exec(`dokku apps:create ${appName}`) return result }

// packages/lib/src/dokku/index.ts export _ from './apps/create' export _ from
'./apps/destroy'

```

**Usage**:

```

// packages/actions/src/service/index.ts import { createDokkuApp } from
'@dflow/lib/dokku'

const result = await createDokkuApp(serverId, 'my-app')

```

### `packages/queue` - BullMQ Workers

**Purpose**: Background job processing with BullMQ

**Structure**:

```

queue/ ├── app/ │ ├── deploy.ts # Deployment queue │ └── destroy.ts ├── server/
│ └── reset.ts └── workers.ts # Worker registration

```

**Example**:

```

// packages/queue/src/app/deploy.ts import { Queue } from 'bullmq' import {
redis } from '@dflow/lib/redis'

export const deployQueue = new Queue('app:deploy', { connection: redis })

export async function addDeployJob(serviceId: string) { await
deployQueue.add('deploy', { serviceId }) }

// Worker deployQueue.process(async (job) => { const { serviceId } = job.data //
Deployment logic })

```

### `packages/payload` - Payload CMS

**Purpose**: Payload CMS collections, globals, and configuration

**Structure**:

```

payload/ ├── collections/ │ ├── Users/ │ ├── Servers/ │ ├── Services/ │ └──
Projects/ ├── globals/ │ ├── Theme/ │ └── Branding/ ├── access/ │ └── isAdmin.ts
└── payload.config.ts

```

**Example**:

```

// packages/payload/src/collections/Servers/index.ts import type {
CollectionConfig } from 'payload'

export const Servers: CollectionConfig = { slug: 'servers', admin: { useAsTitle:
'name', }, fields: [ { name: 'name', type: 'text', required: true, }, { name:
'ipAddress', type: 'text', required: true, }, ], }

// packages/payload/src/payload.config.ts import { Servers } from
'./collections/Servers'

export const config = buildConfig({ collections: [Servers], // ... other config
})

```

### `packages/types` - TypeScript Types

**Purpose**: Shared TypeScript types and interfaces

**Structure**:

```

types/ ├── payload-types.ts # Auto-generated by Payload ├──
payload-types-overrides.ts └── index.ts

```

**Example**:

```

// packages/types/src/index.ts export \* from './payload-types'

// Custom types export interface DeploymentStatus { status: 'pending' |
'building' | 'deployed' | 'failed' progress: number logs: string[] }

```

**Usage**:

```

import type { Server, Service, DeploymentStatus } from '@dflow/types'

```

### `packages/hooks` - React Hooks

**Purpose**: Reusable React hooks

**Example**:

```

// packages/hooks/src/use-mobile.tsx import { useEffect, useState } from 'react'

export function useMobile() { const [isMobile, setIsMobile] = useState(false)

useEffect(() => { const checkMobile = () => { setIsMobile(window.innerWidth
< 768) } checkMobile() window.addEventListener('resize', checkMobile) return ()
=> window.removeEventListener('resize', checkMobile) }, [])

return isMobile }

```

### `packages/providers` - Context Providers

**Purpose**: React Context providers for global state

**Example**:

```

// packages/providers/src/BrandingProvider.tsx 'use client'

import { createContext, useContext } from 'react'

const BrandingContext = createContext<BrandingConfig | null>(null)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
const branding = useBrandingConfig()

return ( <BrandingContext.Provider value={branding}> {children}
</BrandingContext.Provider> ) }

export function useBranding() { return useContext(BrandingContext) }

```

### `packages/stores` - Zustand Stores

**Purpose**: Global state management with Zustand

**Example**:

```

// packages/stores/src/useTerminalStore.ts import { create } from 'zustand'

interface TerminalStore { isOpen: boolean command: string setOpen: (open:
boolean) => void setCommand: (cmd: string) => void }

export const useTerminalStore = create<TerminalStore>((set) => ({ isOpen: false,
command: '', setOpen: (isOpen) => set({ isOpen }), setCommand: (command) =>
set({ command }), }))

```

## 🏛️ Architecture Decisions

### Why Monorepo?

1. **Code Sharing**: Share components, utilities, and types across packages
   without npm publish
2. **Atomic Changes**: Make changes across multiple packages in a single commit
3. **Consistent Dependencies**: One version of React, TypeScript, etc. across
   all code
4. **Better Developer Experience**: One `pnpm install`, one `pnpm dev`
5. **Easier Refactoring**: Refactor with confidence knowing all usages

### Why Turborepo?

1. **Smart Caching**: Never rebuild unchanged packages
2. **Parallel Execution**: Build multiple packages simultaneously
3. **Dependency Awareness**: Build in correct order automatically
4. **Remote Caching**: Share build cache across team (optional)

### Why pnpm?

1. **Fast**: Symlinks instead of copying `node_modules`
2. **Disk Efficient**: Shared global store
3. **Strict**: Prevents phantom dependencies
4. **Workspace Support**: First-class monorepo support

### Package Separation Strategy

**apps/web**: Only Next.js-specific code

- ✅ Pages, layouts, API routes
- ❌ Reusable components, business logic

**packages/actions**: Server-side actions

- ✅ Type-safe server actions
- ❌ Client-side code

**packages/components**: Presentational components

- ✅ React components, UI library
- ❌ Business logic, server actions

**packages/lib**: Core utilities

- ✅ Pure functions, API clients
- ❌ React code, UI components

**packages/payload**: CMS configuration

- ✅ Collections, globals, hooks
- ❌ Application logic

## 📖 Commands Reference

### Workspace Commands

```

# Install all dependencies

pnpm install

# Clean everything

pnpm clean

# Format code

pnpm format

# Check formatting

pnpm format:check

```

### Development Commands

```

# Start dev server (all packages)

pnpm dev

# Start only web app

pnpm web

# Fresh start (clear cache)

pnpm --filter @dflow/web devsafe

```

### Build Commands

```

# Build all packages

pnpm build

# Build specific package

pnpm --filter @dflow/components build

# Build web app

pnpm web:build

```

### Type Commands

```

# Type check all packages

pnpm type-check

# Generate Payload types

pnpm generate:types

# Generate Payload import map

pnpm generate:importmap

```

### Package Management

```

# Add dependency to specific package

pnpm add <package> --filter @dflow/<package-name>

# Add to all packages

pnpm add <package> -w

# Add dev dependency to root

pnpm add -Dw <package>

# Remove dependency

pnpm remove <package> --filter @dflow/<package-name>

# Update dependency

pnpm update <package> --filter @dflow/<package-name>

# Update all dependencies

pnpm update -r

```

### Running Scripts

```

# Run script in specific package

pnpm --filter @dflow/web <script-name>

# Run in multiple packages

pnpm --filter "@dflow/components" --filter "@dflow/actions" type-check

# Run in all packages

pnpm -r <script-name>

```

### Turbo Commands

```

# Build with Turbo

turbo run build

# Force rebuild (ignore cache)

turbo run build --force

# Clear Turbo cache

rm -rf .turbo

```

## ✅ Best Practices

### 1. Package Naming

Always use the `@dflow/` prefix:

```

{ "name": "@dflow/package-name" }

```

### 2. Workspace Dependencies

Use `workspace:*` for internal dependencies:

```

{ "dependencies": { "@dflow/components": "workspace:\*" } }

```

### 3. Exports Configuration

Define explicit exports in `package.json`:

```

{ "exports": { ".": "./src/index.ts", "./ui/_": "./src/ui/_.tsx" } }

```

### 4. TypeScript Paths

Configure paths in `tsconfig.json`:

```

{ "compilerOptions": { "paths": { "@dflow/components":
["../../packages/components/src"] } } }

```

### 5. Import Order

```

// 1. External dependencies import { useState } from 'react' import { Button }
from '@radix-ui/react-button'

// 2. Internal workspace packages import { ServerCard } from
'@dflow/components/servers' import { createServerAction } from
'@dflow/actions/server' import type { Server } from '@dflow/types'

// 3. Relative imports import { Header } from './Header' import './styles.css'

```

### 6. File Organization

```

package/ ├── src/ │ ├── index.ts # Main exports │ ├── feature-a/ │ │ ├──
index.ts # Feature exports │ │ └── utils.ts │ └── feature-b/ │ ├── index.ts │
└── types.ts ├── package.json └── tsconfig.json

```

### 7. Server vs Client Code

Mark server-only code:

```

// packages/actions/src/server/index.ts 'use server'

export async function createServer() { // This only runs on server }

```

Mark client-only code:

```

// packages/components/src/Dialog.tsx 'use client'

export function Dialog() { // This runs on client }

```

### 8. Type Safety

Always export types from `@dflow/types`:

```

// ✅ Good import type { Server } from '@dflow/types'

// ❌ Bad interface Server { // Duplicate type definition }

```

### 9. Documentation

Document package purpose in `README.md`:

```

# @dflow/package-name

Brief description of what this package does.

## Usage

\`\`\`typescript import { Feature } from '@dflow/package-name' \`\`\`

```

### 10. Testing

Keep tests close to source:

```

package/ ├── src/ │ ├── feature.ts │ └── feature.test.ts

```

## 🔧 Troubleshooting

### Issue: "Package not found" error

**Problem**: pnpm can't find a workspace package

**Solution**:

```

# Reinstall dependencies

rm -rf node_modules packages/_/node_modules apps/_/node_modules pnpm install

```

### Issue: TypeScript can't find types

**Problem**: TypeScript path resolution issues

**Solution**:

1. Check `tsconfig.json` paths configuration
2. Verify `package.json` exports field
3. Run `pnpm generate:types` if using Payload
4. Restart TypeScript server in your editor

### Issue: Changes not reflecting

**Problem**: Turbo cache serving stale builds

**Solution**:

```

# Clear Turbo cache

rm -rf .turbo

# Clear Next.js cache

rm -rf apps/web/.next

# Rebuild

pnpm build

```

### Issue: Circular dependency warning

**Problem**: Two packages depend on each other

**Solution**:

- Refactor to remove circular dependency
- Move shared code to a common package (e.g., `@dflow/lib`)
- Example: If `actions` and `queue` both need utilities, move them to `lib`

### Issue: Module not found in production

**Problem**: Import works in dev but not in production build

**Solution**:

1. Check `package.json` exports are correct
2. Ensure transpilation includes the package:

```

// next.config.ts { transpilePackages: [ '@dflow/components', '@dflow/actions',
] }

```

### Issue: Slow builds

**Problem**: Builds taking too long

**Solution**:

1. Check Turbo cache is working: `turbo run build --summarize`
2. Ensure only changed packages rebuild
3. Use `--filter` to build specific packages
4. Check for unnecessary dependencies

### Issue: Type errors after updating Payload

**Problem**: Payload types out of sync

**Solution**:

```

pnpm generate:types

```

## 📚 Migration Guide

### From Single Repo to Monorepo

**Before** (single repo):

```

// src/components/Button.tsx import { doSomething } from '../lib/utils'

```

**After** (monorepo):

```

// packages/components/src/Button.tsx import { doSomething } from
'@dflow/lib/utils'

```

### Import Path Changes

| Old Path                 | New Path                      |
| ------------------------ | ----------------------------- |
| `@/components/ui/button` | `@dflow/components/ui/button` |
| `@/actions/server`       | `@dflow/actions/server`       |
| `@/lib/utils`            | `@dflow/lib/utils`            |
| `@/hooks/use-mobile`     | `@dflow/hooks/use-mobile`     |

### Steps to Migrate Old Code

1. **Identify the package** where code should live
2. **Move files** to appropriate package
3. **Update imports** to use workspace packages
4. **Update package.json** dependencies
5. **Test** that everything works

### Example Migration

**Old structure**:

```

src/ ├── components/ │ └── ServerCard.tsx └── lib/ └── dokku.ts

```

**New structure**:

```

packages/ ├── components/ │ └── src/ │ └── servers/ │ └── ServerCard.tsx └──
lib/ └── src/ └── dokku/ └── index.ts

```

**Update imports**:

```

// Before import { ServerCard } from '@/components/ServerCard' import {
createDokkuApp } from '@/lib/dokku'

// After import { ServerCard } from '@dflow/components/servers' import {
createDokkuApp } from '@dflow/lib/dokku'

```

## 🎯 Next Steps

1. **Explore packages**: Look through each package to understand structure
2. **Read package README**: Each package has its own documentation
3. **Start developing**: Run `pnpm dev` and start coding
4. **Add features**: Create new components, actions, or utilities
5. **Contribute**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution
   guidelines

## 📞 Need Help?

- 📖 [Full Documentation](https://docs.dflow.sh)
- 💬 [Discord Community](https://discord.gg/dflow)
- 🐛 [Report Issues](https://github.com/dflow-sh/dflow/issues)
- 📧 [Email Support](mailto:support@dflow.sh)

---

**Built with ❤️ by the dFlow team**

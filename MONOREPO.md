# Monorepo Guide

This repository is a monorepo managed by [Turborepo](https://turbo.build/repo)
and [pnpm](https://pnpm.io/).

## Structure

```
.
├── apps/
│   └── web/            # The main Next.js application (formerly the root app)
├── packages/           # Shared packages (currently empty)
├── package.json        # Root configuration
├── pnpm-workspace.yaml # Workspace definition
└── turbo.json          # Turborepo pipeline configuration
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v9+)

### Installation

Install dependencies from the root:

```bash
pnpm install
```

## Development

### Running the App

To start the development server for all apps (currently just `web`):

```bash
pnpm dev
```

To run a specific app:

```bash
pnpm --filter web dev
```

### Building

To build all apps and packages:

```bash
pnpm build
```

This runs `turbo build`, which caches outputs. Subsequent builds will be faster.

### Linting

To lint all code:

```bash
pnpm lint
```

## Managing Dependencies

### Adding a Dependency

To add a dependency to a specific app (e.g., `web`):

```bash
pnpm add <package-name> --filter web
```

To add a dependency to the root workspace (e.g., dev tools):

```bash
pnpm add <package-name> -w -D
```

## Workspaces

### Creating a New Package

1. Create a directory in `packages/` (e.g., `packages/ui`).
2. Initialize `package.json` with `name: "@repo/ui"`.
3. Add it as a dependency to an app:
   `pnpm add @repo/ui --filter web --workspace`.

### Creating a New App

1. Create a directory in `apps/`.
2. Initialize it (e.g., `npx create-next-app`).
3. Ensure its `package.json` scripts align with `turbo.json` (e.g., `build`,
   `dev`, `lint`).

## Turborepo

The `turbo.json` file defines the pipeline for tasks.

- **`build`**: Depends on `^build` (dependencies must build first). Outputs are
  cached.
- **`dev`**: Persistent task, no caching.
- **`lint`**: Runs in parallel.

For more details, see the
[Turborepo documentation](https://turbo.build/repo/docs).

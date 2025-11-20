#!/bin/bash

set -e

ROOT="$(pwd)"

WEB_DIR="$ROOT/apps/web"
CORE_DIR="$ROOT/packages/core"
WEB_SRC="$WEB_DIR/src"
CORE_SRC="$CORE_DIR/src"

echo "🚀 Starting full dFlow monorepo migration..."

# 1. Create directories
mkdir -p "$WEB_SRC"
mkdir -p "$CORE_SRC"

# 2. Move Next.js app folder only
if [ -d src/app ]; then
  echo "Moving Next.js app routes"
  mv src/app "$WEB_SRC"/
fi

# 3. Move Next.js specific config files to apps/web root
for f in env.ts next.config.ts package.json tsconfig.json vercel.json; do
  if [ -f "$f" ]; then
    echo "Moving $f to apps/web/"
    mv "$f" "$WEB_DIR"/
  fi
done

# 4. Move all shared/server/business logic and UI kits to core/src
for folder in actions components emails hooks lib middleware.ts payload plugins providers queues stores docs scripts; do
  if [ -e "src/$folder" ]; then
    echo "Moving $folder to packages/core/src/"
    mv "src/$folder" "$CORE_SRC"/
  fi
done

if [ -f "src/payload.config.ts" ]; then
  mkdir -p "$CORE_SRC/payload"
  echo "Moving payload.config.ts to packages/core/src/payload/config.ts"
  mv src/payload.config.ts "$CORE_SRC/payload/config.ts"
fi

if [ -f "src/payload-types.ts" ]; then
  echo "Moving payload-types.ts to packages/core/src/"
  mv src/payload-types.ts "$CORE_SRC"/
fi

# 5. Remove root src if empty
rmdir src 2>/dev/null || true

# 6. Create root pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
echo "Created pnpm-workspace.yaml"

# 7. Create root turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF
echo "Created turbo.json"

# 8. Create root tsconfig.base.json
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDirs": ["./apps", "./packages"],
    "baseUrl": ".",
    "strict": true,
    "skipLibCheck": true
  }
}
EOF
echo "Created tsconfig.base.json"

# 9. Setup apps/web/package.json
cat > "$WEB_DIR/package.json" << 'EOF'
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@dflow/core": "workspace:*",
    "next": "15.2.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
EOF
echo "Created apps/web/package.json"

# 10. Setup apps/web/tsconfig.json
cat > "$WEB_DIR/tsconfig.json" << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve"
  },
  "include": ["src"]
}
EOF
echo "Created apps/web/tsconfig.json"

# 11. Setup packages/core/package.json
cat > "$CORE_DIR/package.json" << 'EOF'
{
  "name": "@dflow/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./*": "./dist/*.js"
  },
  "scripts": {
    "build": "tsc -b",
    "watch": "tsc -b -w"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  },
  "dependencies": {
    "@aws-sdk/client-ec2": "^3.787.0",
    "bullmq": "^5.40.0",
    "ioredis": "^5.4.2",
    "zod": "^3.24.1"
  }
}
EOF
echo "Created packages/core/package.json"

# 12. Setup packages/core/tsconfig.json
cat > "$CORE_DIR/tsconfig.json" << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
EOF
echo "Created packages/core/tsconfig.json"

echo ""
echo "✅ Full migration done successfully."
echo "Please run 'pnpm install' and update all imports to '@dflow/core/*' from your web app."
echo "Start development with 'pnpm dev' or 'turbo run dev'."

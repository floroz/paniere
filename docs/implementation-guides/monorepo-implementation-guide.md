# Monorepo Implementation Guide

## Overview

This guide provides step-by-step instructions for transforming Paniere from a single React app into a TypeScript monorepo structure. This implements the decisions made in [ADR 2: Monorepo Architecture and Tooling](../adr/002-monorepo-architecture-and-tooling.md).

**Prerequisites**: Familiarity with pnpm, TypeScript, and React.

**Implementation Strategy**:

- **pnpm workspaces** for monorepo management
- **Shared types package** for end-to-end type safety
- **Parallel task execution** for improved development experience
- **Incremental migration** to minimize risk

## Migration Checklist ✅ COMPLETED

### Package Manager Migration ✅

- [x] Install pnpm globally
- [x] Remove `package-lock.json` and `node_modules`
- [x] Run `pnpm install` to generate `pnpm-lock.yaml`
- [x] Verify all existing scripts work with pnpm
- [x] Commit the package manager migration

### Monorepo Structure ✅

- [x] Create root `package.json` with pnpm scripts
- [x] Create `pnpm-workspace.yaml` configuration
- [x] Create packages directory structure
- [x] Move existing frontend files to `packages/frontend/`
- [x] Update root TypeScript configuration with project references

### Shared Package ✅

- [x] Create `packages/shared/` with proper package.json
- [x] Implement shared type definitions (game.ts, events.ts)
- [x] Add Zod validation schemas
- [x] Set up proper exports in index.ts
- [x] Add shared utilities (date formatting)
- [x] Verify shared package builds successfully

### Backend Package ✅

- [x] Create `packages/backend/` structure
- [x] Set up basic Fastify server with health endpoint
- [x] Configure TypeScript with shared package reference
- [x] Verify backend builds and runs
- [x] Test shared types integration

### Frontend Package ✅

- [x] Update frontend package.json with shared dependency
- [x] Configure Vite aliases for shared package imports
- [x] Update TypeScript configuration
- [x] Test importing shared types in frontend
- [x] Verify frontend builds and runs

### CI/CD Updates ✅

- [x] GitHub Actions workflow (already optimized)
- [x] Netlify configuration for monorepo (already configured)
- [x] Test CI/CD pipeline builds all packages
- [x] Verify deployment still works

### Validation ✅

- [x] Install dependencies with `pnpm install`
- [x] Run `pnpm run type-check` successfully
- [x] Run `pnpm run build` for all packages (dependency-aware)
- [x] Test development workflow with `pnpm run dev` (parallel execution)
- [x] Verify type sharing works across packages
- [x] Document development workflow

## Phase 0: Package Manager Migration (Day 1 - Pre-setup)

### 0.1 Install pnpm

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Verify installation
pnpm --version
```

### 0.2 Migrate from npm to pnpm

```bash
# Remove existing npm artifacts
rm package-lock.json
rm -rf node_modules

# Generate pnpm lockfile
pnpm install

# Verify everything still works
pnpm run dev
pnpm run build
pnpm run type-check
```

### 0.3 Update Scripts (Optional)

If your current `package.json` has any npm-specific scripts, update them:

```json
{
  "scripts": {
    "install:clean": "rm -rf node_modules pnpm-lock.yaml && pnpm install",
    "update:deps": "pnpm update"
  }
}
```

### 0.4 Commit Migration

```bash
# Stage the new lockfile and removal of old one
git add pnpm-lock.yaml
git add package.json  # if you updated scripts
git rm package-lock.json

# Commit the migration
git commit -m "migrate from npm to pnpm

- Remove package-lock.json
- Add pnpm-lock.yaml
- Verify all scripts work with pnpm"
```

## Phase 1: Monorepo Setup (Day 1)

### 1.1 Create Monorepo Structure

```bash
# From project root
mkdir -p packages/{frontend,backend,shared}/src

# Move existing frontend files
git mv src packages/frontend/
git mv public packages/frontend/
git mv index.html packages/frontend/
git mv vite.config.ts packages/frontend/
git mv tsconfig.app.json packages/frontend/
git mv tailwind.config.js packages/frontend/
```

### 1.2 Create Root package.json

```json
{
  "name": "@floroz/paniere-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm run --recursive --parallel dev",
    "dev:frontend": "pnpm run --filter @paniere/frontend dev",
    "dev:backend": "pnpm run --filter @paniere/backend dev",
    "build": "pnpm run --filter '@paniere/shared^...' build",
    "lint": "pnpm run --recursive lint",
    "type-check": "pnpm run --recursive type-check",
    "test": "pnpm run --recursive test",
    "clean": "pnpm run --recursive clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^22.12.0",
    "typescript": "~5.7.2",
    "prettier": "^3.5.3",
    "eslint": "^9.22.0"
  },
  "engines": {
    "node": ">=22.12.0",
    "pnpm": ">=9"
  }
}
```

### 1.3 Create pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
```

### 1.4 Update Frontend package.json

```json
{
  "name": "@paniere/frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc -b --noEmit",
    "clean": "rm -rf dist node_modules/.vite"
  },
  "dependencies": {
    "@paniere/shared": "workspace:*"
    // ... existing dependencies
  }
}
```

### 1.5 Create Shared Package

```bash
# Create shared package files
cat > packages/shared/package.json << 'EOF'
{
  "name": "@paniere/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -b",
    "watch": "tsc -b --watch",
    "type-check": "tsc -b --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "zod": "^3.24.1"
  }
}
EOF

cat > packages/shared/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF
```

### 1.6 Create Root TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

### 1.7 Update Import Paths

```typescript
// Before: packages/frontend/src/App.tsx
import { useGameStore } from "./store/useGameStore";

// After: packages/frontend/src/App.tsx
import { useGameStore } from "@/store/useGameStore";
import type { GameState } from "@paniere/shared";
```

Update `packages/frontend/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@paniere/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
});
```

## Phase 2: Shared Types (Day 2)

### 2.1 Create Type Definitions

Create `packages/shared/src/types/game.ts`:

```typescript
export interface GameSession {
  id: string;
  masterPlayerId: string;
  players: Player[];
  gameState: GameState;
  createdAt: Date;
  lastActivity: Date;
}

export interface Player {
  id: string;
  name?: string;
  cartelle: Cartella[];
  connected: boolean;
  joinedAt: Date;
}

export interface Cartella {
  id: string;
  numbers: number[][];
  markedNumbers: Set<number>;
}

export interface GameState {
  drawnNumbers: number[];
  status: "waiting" | "active" | "paused" | "completed";
  startedAt?: Date;
}

export type PrizeType = "ambo" | "terno" | "quaterna" | "cinquina" | "tombola";
```

### 2.2 Create Event Types

Create `packages/shared/src/types/events.ts`:

```typescript
import { GameState, Player, PrizeType } from "./game";

export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
  "number:drawn": (payload: { number: number; drawnNumbers: number[] }) => void;
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "prize:won": (prize: {
    playerId: string;
    playerName?: string;
    prizeType: PrizeType;
  }) => void;
}

export interface ClientToServerEvents {
  "game:create": (
    callback: (response: {
      success: boolean;
      gameId?: string;
      token?: string;
      error?: string;
    }) => void,
  ) => void;

  "game:join": (
    gameId: string,
    callback: (response: {
      success: boolean;
      token?: string;
      player?: Player;
      error?: string;
    }) => void,
  ) => void;

  "number:draw": (
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;
}
```

### 2.3 Create Validation Schemas

Create `packages/shared/src/validation/schemas.ts`:

```typescript
import { z } from "zod";

export const gameIdSchema = z
  .string()
  .length(6)
  .regex(/^[A-Z0-9]{6}$/);

export const playerNameSchema = z.string().min(1).max(20).optional();
```

### 2.4 Export Everything

Create `packages/shared/src/index.ts`:

```typescript
export * from "./types/game";
export * from "./types/events";
export * from "./validation/schemas";
```

## Phase 3: Basic Backend Setup (Day 3-4)

> **Note**: For complete multiplayer backend implementation, see [Multiplayer Implementation Guide](../multiplayer-implementation-guide.md). This section covers basic backend package setup.

### 3.1 Create Backend Package Structure

```bash
# Create backend package
mkdir -p packages/backend/src

# Create basic package.json
cat > packages/backend/package.json << 'EOF'
{
  "name": "@paniere/backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -b",
    "start": "node dist/server.js",
    "type-check": "tsc -b --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@paniere/shared": "workspace:*",
    "fastify": "^5.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.12.0",
    "tsx": "^4.19.2"
  }
}
EOF
```

### 3.2 Create Basic Server

Create `packages/backend/src/server.ts`:

```typescript
import Fastify from "fastify";

const app = Fastify({ logger: true });

// Health check endpoint
app.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

// Start server
const server = await app.listen({
  port: parseInt(process.env.PORT || "3000"),
  host: "0.0.0.0",
});

console.log(`🚀 Backend server running on port ${process.env.PORT || 3000}`);
```

### 3.3 Create TypeScript Configuration

Create `packages/backend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "target": "ES2022",
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"],
  "references": [{ "path": "../shared" }]
}
```

## Phase 4: Frontend Package Updates (Day 5)

### 4.1 Update Frontend Package Configuration

Update `packages/frontend/package.json` to include shared package dependency:

```json
{
  "name": "@paniere/frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc -b --noEmit",
    "clean": "rm -rf dist node_modules/.vite"
  },
  "dependencies": {
    "@paniere/shared": "workspace:*"
    // ... existing dependencies
  }
}
```

### 4.2 Update Vite Configuration

Update `packages/frontend/vite.config.ts` to handle shared package imports:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@paniere/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
});
```

### 4.3 Update TypeScript Configuration

Create `packages/frontend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"],
  "references": [{ "path": "../shared" }]
}
```

## Phase 5: CI/CD Updates (Day 6)

### 5.1 Update GitHub Actions

Update `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "22.12"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Type check all packages
        run: pnpm run type-check

      - name: Lint all packages
        run: pnpm run lint

      - name: Build all packages (dependency-aware)
        run: pnpm run build
```

### 5.2 Update Deployment Configuration

Update `netlify.toml` for frontend deployment:

```toml
[build]
  base = "."
  command = "pnpm install --frozen-lockfile && pnpm run --filter @paniere/frontend build"
  publish = "packages/frontend/dist"

[build.environment]
  NODE_VERSION = "22.12"
  PNPM_VERSION = "9"

[[plugins]]
  package = "@netlify/plugin-pnpm"
```

## Phase 6: Development Workflow

### 6.1 Adding Dependencies

```bash
# Add dependency to specific package
pnpm add lodash --filter @paniere/backend
pnpm add -D @types/lodash --filter @paniere/backend

# Add dependency to all packages
pnpm add -w zod  # -w means workspace root

# Add dev dependency to workspace root
pnpm add -Dw prettier

# Update all dependencies
pnpm update --recursive
```

## Phase 7: Testing and Validation

### 7.1 Verify Monorepo Structure

```bash
# Install all dependencies
pnpm install

# Verify shared package builds
pnpm run --filter @paniere/shared build

# Verify type checking across packages
pnpm run type-check

# Test development workflow
pnpm run dev:frontend  # Should work with shared types
pnpm run dev:backend   # Should work with shared types

# Test parallel development (both frontend and backend)
pnpm run dev  # Runs both in parallel
```

### 7.2 Test Type Safety

Create a test file to verify type sharing works:

`packages/frontend/src/test-types.ts`:

```typescript
import type { GameState, Player } from "@paniere/shared";

// This should compile without errors
const testGameState: GameState = {
  drawnNumbers: [1, 2, 3],
  status: "waiting",
  currentPrizes: [],
};

const testPlayer: Player = {
  id: "test-123",
  cartelle: [],
  connected: true,
  joinedAt: new Date(),
  lastSeen: new Date(),
};

console.log("Type sharing works!", { testGameState, testPlayer });
```

## Troubleshooting

### Common Issues

1. **Package Manager Migration Issues**

   ```bash
   # If pnpm install fails due to package conflicts
   pnpm install --force

   # If specific packages don't work with pnpm symlinks
   pnpm install --shamefully-hoist

   # Check for packages that might have issues with pnpm
   pnpm audit
   ```

2. **TypeScript Import Errors**

   ```bash
   # Build shared package first
   pnpm run --filter @paniere/shared build

   # Check TypeScript project references
   pnpm run type-check
   ```

3. **Workspace Dependency Issues**

   ```bash
   # Clean install everything
   rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
   pnpm install
   ```

4. **pnpm Symlink Issues**

   ```bash
   # Force reinstall with no symlinks (if needed for specific packages)
   pnpm install --no-hoist

   # Or check if package has pnpm compatibility issues
   pnpm why <package-name>
   ```

5. **Vite/Build Issues**
   ```bash
   # Clear build caches
   pnpm run clean
   pnpm run --filter @paniere/shared build
   ```

## Next Steps

After completing the monorepo migration:

1. **Multiplayer Implementation**: Follow [Multiplayer Implementation Guide](../multiplayer-implementation-guide.md)
2. **Enhanced Type Safety**: Add more shared utilities and validation
3. **Development Tooling**: Consider adding Turborepo for better build caching
4. **Testing Strategy**: Set up cross-package testing
5. **Documentation**: Document shared package APIs

## Related Documentation

- [ADR 2: Monorepo Architecture and Tooling](../adr/002-monorepo-architecture-and-tooling.md) - Strategic decisions
- [Multiplayer Implementation Guide](../multiplayer-implementation-guide.md) - Full multiplayer backend setup
- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [pnpm CLI Reference](https://pnpm.io/cli/run)

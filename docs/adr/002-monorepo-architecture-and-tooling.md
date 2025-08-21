# ADR 2: Monorepo Architecture and Tooling

## Status

Accepted

## Context

The Paniere project is transitioning from a single React repository to a full-stack application with real-time multiplayer capabilities. This requires a development structure that supports:

- **Code sharing**: Shared types, utilities, and business logic between frontend and backend
- **Type safety**: End-to-end TypeScript compilation and type checking across packages
- **Development efficiency**: Simplified dependency management and unified development workflows
- **Deployment simplicity**: Clear separation of deployable units with independent CI/CD
- **Team collaboration**: Consistent tooling and development experience
- **Real-time communication**: Type-safe WebSocket events between client and server

The project will consist of three main packages:

1. **Frontend**: React + TypeScript application (existing codebase to be moved)
2. **Backend**: Fastify + Socket.io server (new package)
3. **Shared**: Common types, utilities, and business logic (new package)

### Package Manager Comparison

#### 1. npm Workspaces

- **Pros**: Built into npm, zero configuration overhead, perfect for simple monorepos, familiar to team, great performance improvements in npm 7+
- **Cons**: Basic task orchestration (sequential execution, limited filtering), no parallel execution across workspaces
- **Assessment**: Simple option but task orchestration limitations outweigh simplicity benefits

#### 2. pnpm Workspaces (Recommended)

- **Pros**: Fastest installation and best disk efficiency, excellent workspace support, advanced task orchestration (parallel execution, sophisticated filtering), symlink-based saves massive disk space
- **Cons**: Different package manager (learning curve), some packages might have compatibility issues
- **Assessment**: Superior task orchestration and performance benefits justify the minimal learning curve

#### 3. Yarn Workspaces

- **Pros**: Mature ecosystem, good tooling integration
- **Cons**: Slower than pnpm, less active development than npm/pnpm
- **Assessment**: No significant advantages over npm workspaces

#### 4. Nx

- **Pros**: Advanced build system, dependency graph, powerful generators, excellent caching
- **Cons**: Steep learning curve, complex configuration, overkill for small teams
- **Assessment**: Too complex for current project size

#### 5. Lerna

- **Pros**: Mature, good for publishing multiple packages, semantic versioning
- **Cons**: Primarily for library publishing, overlaps with npm workspaces, maintenance mode
- **Assessment**: Not needed for application development

#### 6. Turborepo

- **Pros**: Excellent build caching, simple configuration, good for CI/CD
- **Cons**: Additional tooling overhead, learning curve
- **Assessment**: Good future consideration but not necessary initially

#### 7. Rush

- **Pros**: Enterprise-grade, phantom dependency detection, advanced policies
- **Cons**: Complex setup, designed for large organizations, overkill
- **Assessment**: Too heavyweight for current needs

### Task Orchestration Comparison: npm vs pnpm

The key difference between npm and pnpm workspaces lies in how they handle running scripts across multiple packages:

#### npm Workspaces Task Execution

```bash
# Sequential execution - runs one workspace at a time
npm run build --workspaces

# Target specific workspace
npm run test --workspace=frontend

# Limited filtering - basic workspace selection only
npm run lint --workspace=backend --workspace=shared
```

**Limitations:**

- Scripts run sequentially across workspaces (slower for large monorepos)
- Basic filtering: can only target specific workspaces by name
- No dependency-aware execution order
- Manual script coordination required in root package.json

#### pnpm Workspaces Task Execution

```bash
# Parallel execution across all workspaces
pnpm run --recursive build

# Advanced filtering by package patterns
pnpm run --filter "@paniere/*" test
pnpm run --filter "!@paniere/frontend" build

# Dependency-aware execution
pnpm run --filter "@paniere/shared^..." build  # Build shared and dependents

# Target packages by location
pnpm run --filter "./packages/backend" start
```

**Advantages:**

- **Parallel Execution**: Runs compatible scripts simultaneously across packages
- **Advanced Filtering**: Complex package selection with patterns, dependencies, and locations
- **Dependency Awareness**: Can build packages in dependency order automatically
- **Performance**: Significantly faster for large monorepos with many packages

#### Practical Impact

For the Paniere project with 3 packages (frontend, backend, shared):

**npm approach:**

```json
{
  "scripts": {
    "dev": "npm run dev --workspace=backend & npm run dev --workspace=frontend",
    "build": "npm run build --workspace=shared && npm run build --workspace=backend && npm run build --workspace=frontend"
  }
}
```

- Manual dependency ordering required
- Background processes (`&`) needed for parallel dev servers
- Sequential builds even when packages could build in parallel

**pnpm approach:**

```json
{
  "scripts": {
    "dev": "pnpm run --recursive --parallel dev",
    "build": "pnpm run --filter '@paniere/shared^...' build"
  }
}
```

- Automatic dependency resolution
- Built-in parallel execution
- Cleaner script definitions

### Type Safety Strategy Requirements

To achieve tRPC-like type safety without tRPC (due to real-time requirements), we need:

- **Shared Type Definitions**: Common interfaces for game state, events, and API responses
- **WebSocket Event Types**: Type-safe Socket.io event definitions
- **Runtime Validation**: Zod schemas for input validation and type inference
- **Build-time Validation**: TypeScript compilation across all packages
- **Development Experience**: Auto-completion and type checking in IDEs

## Decision

We will use **pnpm Workspaces** for monorepo management.

### Project Structure

```
paniere/
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── packages/
│   ├── frontend/               # React application
│   │   ├── package.json
│   │   ├── src/
│   │   └── vite.config.ts
│   ├── backend/                # Fastify + Socket.io server
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   └── shared/                 # Shared types and utilities
│       ├── package.json
│       ├── src/
│       │   ├── types/          # Shared TypeScript types
│       │   ├── utils/          # Shared utilities
│       │   └── constants/      # Shared constants
│       └── tsconfig.json
└── tsconfig.json               # Root TypeScript configuration
```

### Root Configuration

#### package.json

```json
{
  "name": "paniere-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm run --recursive --parallel dev",
    "build": "pnpm run --filter '@paniere/shared^...' build",
    "type-check": "pnpm run --recursive type-check",
    "lint": "pnpm run --recursive lint",
    "test": "pnpm run --recursive test"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

#### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
```

#### Root tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "paths": {
      "@paniere/shared": ["./packages/shared/src"],
      "@paniere/shared/*": ["./packages/shared/src/*"]
    }
  },
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/backend" },
    { "path": "./packages/frontend" }
  ]
}
```

### Package-Level Configuration

#### Shared Package (packages/shared/package.json)

```json
{
  "name": "@paniere/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./utils": "./src/utils/index.ts"
  }
}
```

#### Backend Package (packages/backend/package.json)

```json
{
  "name": "@paniere/backend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@paniere/shared": "*",
    "fastify": "^4.0.0",
    "socket.io": "^4.0.0"
  }
}
```

#### Frontend Package (packages/frontend/package.json)

```json
{
  "name": "@paniere/frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@paniere/shared": "*",
    "react": "^18.0.0",
    "socket.io-client": "^4.0.0"
  }
}
```

## Rationale

1. **Superior Task Orchestration**: Parallel execution and advanced filtering significantly improve development workflow
2. **Performance**: Faster installs, disk efficiency, and parallel builds provide immediate benefits
3. **Developer Experience**: Dependency-aware execution and clean script definitions reduce friction
4. **TypeScript Integration**: Works seamlessly with TypeScript project references
5. **Future-Proof**: Advanced features scale better as the project grows
6. **Minimal Learning Curve**: While new, pnpm's API is familiar to npm users and well-documented

## Consequences

### Positive

- **Parallel Task Execution**: Significantly faster builds and development workflows
- **Advanced Filtering**: Sophisticated package targeting with patterns and dependency graphs
- **Performance Benefits**: Faster installs, disk efficiency, and build optimization
- **Type Safety**: Shared package enables end-to-end type checking
- **Dependency Management**: Automatic workspace linking with dependency-aware execution
- **Developer Experience**: Clean script definitions and powerful CLI features

### Negative

- **New Package Manager**: Team needs to learn pnpm commands and workflows
- **Potential Compatibility**: Some packages might have edge case issues with pnpm's symlink approach
- **CI/CD Setup**: Requires pnpm installation in build environments

### Mitigation

- Provide clear documentation and examples for pnpm workflows
- Use `pnpm dlx` for one-off script executions to avoid global installations
- Include pnpm installation in CI/CD setup documentation
- Most npm commands have direct pnpm equivalents, reducing learning curve

## Type Safety Strategy

### Shared Package Architecture

The shared package will be organized to provide maximum type safety and code reuse:

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── game.ts           # Game domain types
│   │   ├── events.ts         # Socket.io event types
│   │   ├── api.ts            # REST API types
│   │   └── index.ts
│   ├── validation/
│   │   ├── schemas.ts        # Zod schemas
│   │   └── index.ts
│   ├── utils/
│   │   ├── gameLogic.ts      # Shared game utilities
│   │   └── validation.ts     # Validation helpers
│   ├── constants/
│   │   └── game.ts           # Game constants
│   └── index.ts              # Main exports
├── package.json
└── tsconfig.json
```

### Core Type Definitions

#### Game Domain Types

```typescript
// packages/shared/src/types/game.ts
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
  lastSeen: Date;
}

export interface Cartella {
  id: string;
  numbers: number[][];
  markedNumbers: Set<number>;
}

export interface GameState {
  drawnNumbers: number[];
  startedAt?: Date;
  status: "waiting" | "active" | "paused" | "completed";
  currentPrizes: Prize[];
}

export interface Prize {
  type: "ambo" | "terno" | "quaterna" | "cinquina" | "tombola";
  playerId: string;
  numbers: number[];
  timestamp: Date;
}
```

#### Type-Safe WebSocket Events

```typescript
// packages/shared/src/types/events.ts
import { GameState, Player, Prize } from "./game";

// Server to Client Events
export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
  "number:drawn": (payload: NumberDrawnPayload) => void;
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "player:reconnected": (playerId: string) => void;
  "prize:won": (prize: PrizeNotification) => void;
  "game:paused": (reason: string) => void;
  "game:resumed": () => void;
  "game:ended": (reason: string) => void;
  error: (error: GameError) => void;
}

// Client to Server Events
export interface ClientToServerEvents {
  "game:create": (
    data: CreateGameData,
    callback: (response: CreateGameResponse) => void,
  ) => void;
  "game:join": (
    data: JoinGameData,
    callback: (response: JoinGameResponse) => void,
  ) => void;
  "number:draw": (callback: (response: DrawNumberResponse) => void) => void;
  "prize:claim": (
    data: ClaimPrizeData,
    callback: (response: BaseResponse) => void,
  ) => void;
}

// Socket Data
export interface SocketData {
  playerId: string;
  gameId: string;
  isMaster: boolean;
  sessionToken: string;
}
```

#### Runtime Validation Schemas

```typescript
// packages/shared/src/validation/schemas.ts
import { z } from "zod";

// Game ID validation
export const gameIdSchema = z
  .string()
  .length(6)
  .regex(
    /^[A-Z0-9]{6}$/,
    "Game ID must be 6 uppercase alphanumeric characters",
  );

// Player name validation
export const playerNameSchema = z
  .string()
  .min(1)
  .max(20)
  .regex(
    /^[a-zA-Z0-9\s]+$/,
    "Name can only contain letters, numbers, and spaces",
  );

// Create game validation
export const createGameSchema = z.object({
  masterName: playerNameSchema.optional(),
});

// Join game validation
export const joinGameSchema = z.object({
  gameId: gameIdSchema,
  playerName: playerNameSchema.optional(),
});

// Type inference from schemas
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
```

### Type Safety Implementation

#### Backend Type Safety

```typescript
// packages/backend/src/websocket/typed-server.ts
import { Server } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from "@paniere/shared";

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;
```

#### Frontend Type Safety

```typescript
// packages/frontend/src/lib/socket.ts
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@paniere/shared";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(): TypedSocket {
  return io(import.meta.env.VITE_BACKEND_URL, {
    transports: ["websocket"],
    reconnection: true,
  });
}
```

### Shared Utilities

```typescript
// packages/shared/src/utils/gameLogic.ts
export function checkForPrize(
  cartella: Cartella,
  drawnNumbers: number[],
): Prize | null {
  // Shared game logic used by both frontend and backend
}

export function generateCartella(): Cartella {
  // Cartella generation logic
}

export function validatePrizeClaim(
  cartella: Cartella,
  drawnNumbers: number[],
  prizeType: Prize["type"],
): boolean {
  // Server-side prize validation
}
```

### Benefits of This Type Safety Approach

#### 1. End-to-End Type Safety

- Shared types ensure frontend and backend stay in sync
- TypeScript catches breaking changes at compile time
- Auto-completion in IDEs for all events and payloads
- Compile-time errors for invalid events

#### 2. Runtime Validation

- Zod schemas validate untrusted input
- Type guards ensure data integrity
- Better error messages for clients
- Automatic type inference from schemas

#### 3. Maintainability

- Single source of truth for types
- Easy refactoring across packages
- Clear API contracts
- Self-documenting code

#### 4. Developer Experience

- IntelliSense for all events and payloads
- Comprehensive type checking without tRPC complexity
- Familiar TypeScript patterns
- Reduced cognitive load

## Benefits Over Alternatives

### vs tRPC

- **Real-time Support**: Native WebSocket support without workarounds
- **Simplicity**: No additional framework learning curve
- **Flexibility**: Can handle both RPC and event-driven patterns
- **Performance**: Direct WebSocket communication

### vs Separate Repositories

- **Code Sharing**: Shared types and utilities prevent duplication
- **Consistency**: Unified tooling and development workflows
- **Atomic Changes**: Update types across frontend/backend in single commit
- **Development Speed**: Single `npm install` and unified scripts

### vs Complex Monorepo Tools

- **Simplicity**: Zero additional tooling or configuration
- **Learning Curve**: Familiar npm concepts
- **Maintenance**: No tool-specific configuration to maintain
- **Migration**: Easy to adopt more complex tools later if needed

## Future Considerations

### Migration Path

If the project grows significantly:

1. **Phase 1**: Consider Turborepo for build caching and CI/CD optimization
2. **Phase 2**: Evaluate Nx for advanced build orchestration and code generation
3. **Phase 3**: Assess needs for more sophisticated dependency management

### Build Optimization

- Implement TypeScript project references for incremental builds
- Add build caching strategies for CI/CD
- Consider parallel execution tools if build times become problematic

## Development Workflow

### Initial Setup

```bash
pnpm install                  # Install all dependencies
pnpm run type-check          # Verify TypeScript compilation
pnpm run dev                 # Start development servers (parallel)
```

### Adding Dependencies

```bash
# Add to specific workspace
pnpm add lodash --filter @paniere/backend

# Add to root (dev dependencies)
pnpm add -Dw jest
```

### Type-Safe Imports

```typescript
// In backend
import { GameState, Player } from "@paniere/shared/types";
import { checkForPrize } from "@paniere/shared/utils";

// In frontend
import { ServerToClientEvents } from "@paniere/shared/types/events";
import type { Socket } from "socket.io-client";

const socket: Socket<ServerToClientEvents> = io();
```

## References

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

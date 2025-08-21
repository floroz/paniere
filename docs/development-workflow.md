# Development Workflow Guide

## Overview

This guide covers day-to-day development workflows for the Paniere monorepo using pnpm workspaces.

## 🚀 Quick Start

```bash
# Install all dependencies
pnpm install

# Start development (both frontend and backend in parallel)
pnpm run dev

# Start only frontend
pnpm run dev:frontend

# Start only backend
pnpm run dev:backend
```

## 📦 Package Management

### Adding Dependencies

```bash
# Add dependency to specific package
pnpm add lodash --filter @paniere/backend
pnpm add -D @types/lodash --filter @paniere/backend

# Add dependency to frontend
pnpm add react-router-dom --filter @paniere/frontend
pnpm add -D @types/react-router-dom --filter @paniere/frontend

# Add dependency to shared package
pnpm add dayjs --filter @paniere/shared

# Add dependency to workspace root (affects all packages)
pnpm add -w zod

# Add dev dependency to workspace root
pnpm add -Dw prettier
```

### Removing Dependencies

```bash
# Remove from specific package
pnpm remove lodash --filter @paniere/backend

# Remove from workspace root
pnpm remove -w zod
```

### Updating Dependencies

```bash
# Update all dependencies in all packages
pnpm update --recursive

# Update specific package dependencies
pnpm update --filter @paniere/frontend

# Check outdated packages
pnpm outdated --recursive
```

## 🏗️ Building & Type Checking

```bash
# Build all packages (dependency-aware order)
pnpm run build

# Build specific package
pnpm run --filter @paniere/shared build
pnpm run --filter @paniere/frontend build

# Type check all packages
pnpm run type-check

# Type check specific package
pnpm run --filter @paniere/backend type-check
```

## 🧹 Code Quality

```bash
# Lint all packages
pnpm run lint

# Lint specific package
pnpm run --filter @paniere/frontend lint

# Format all code
pnpm run format

# Check formatting
pnpm run format:check

# Clean all build artifacts
pnpm run clean
```

## 🔄 Development Patterns

### Working with Shared Types

```typescript
// In any package, import shared types
import type { GameState, Player, PrizeType } from "@paniere/shared";
import { gameIdSchema } from "@paniere/shared";

// Use shared validation
const isValidGameId = gameIdSchema.safeParse("ABC123");
```

### Adding New Shared Types

1. Add types to `packages/shared/src/types/`
2. Export from `packages/shared/src/index.ts`
3. Build shared package: `pnpm run --filter @paniere/shared build`
4. Use in other packages

### Backend Development

```bash
# Start backend in watch mode
pnpm run dev:backend

# The server will restart automatically on file changes
# Access health check: http://localhost:3000/health
```

### Frontend Development

```bash
# Start frontend dev server
pnpm run dev:frontend

# Vite will hot-reload on changes
# Frontend available at: http://localhost:5173
```

## 🧪 Testing Strategy

### Running Tests

```bash
# Run all tests (when implemented)
pnpm run test

# Run tests for specific package
pnpm run --filter @paniere/frontend test
pnpm run --filter @paniere/backend test
```

### Test File Locations

```
packages/
├── shared/
│   └── src/
│       └── __tests__/          # Unit tests for shared utilities
├── frontend/
│   └── src/
│       ├── components/
│       │   └── __tests__/      # Component tests
│       └── utils/
│           └── __tests__/      # Utility tests
└── backend/
    └── src/
        ├── routes/
        │   └── __tests__/      # Route tests
        └── services/
            └── __tests__/      # Service tests
```

## 🔍 Debugging

### TypeScript Issues

```bash
# Clean build and rebuild
pnpm run clean
pnpm run --filter @paniere/shared build
pnpm run type-check

# Check workspace dependencies
pnpm list --recursive
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
pnpm install

# Check for phantom dependencies
pnpm list --filter @paniere/frontend
```

### Build Issues

```bash
# Clean and rebuild everything
pnpm run clean
pnpm install
pnpm run build
```

## 📁 Project Structure

```
packages/
├── shared/           # Shared types and utilities
│   ├── src/
│   │   ├── types/    # Type definitions
│   │   ├── validation/ # Zod schemas
│   │   └── index.ts  # Main exports
│   └── dist/         # Built types and JS
├── frontend/         # React app
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── dist/         # Built app
└── backend/          # Fastify server
    ├── src/          # Source code
    └── dist/         # Built server
```

## 🔧 Configuration Files

- `pnpm-workspace.yaml` - Defines workspace packages
- `package.json` - Root package with shared scripts
- `tsconfig.json` - Root TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `.github/workflows/ci.yml` - CI/CD pipeline
- `netlify.toml` - Deployment configuration

## ⚡ Performance Tips

### Parallel Development

```bash
# Run multiple dev servers in parallel
pnpm run dev  # Starts both frontend and backend

# In separate terminals for more control:
pnpm run dev:frontend  # Terminal 1
pnpm run dev:backend   # Terminal 2
```

### Selective Building

```bash
# Only build what you need
pnpm run --filter @paniere/shared build
pnpm run --filter @paniere/frontend build

# Build dependencies first, then dependents
pnpm run --filter '@paniere/shared^...' build
```

### Watch Mode

```bash
# Watch shared package for changes
pnpm run --filter @paniere/shared watch

# This will rebuild shared types automatically
# Frontend and backend will pick up changes via workspace links
```

## 🚀 Deployment

### Frontend (Netlify)

```bash
# Build frontend for production
pnpm run build

# Files are built to packages/frontend/dist/
# Netlify automatically deploys from this directory
```

### Backend (Future)

```bash
# Build backend for production
pnpm run --filter @paniere/backend build

# Run production server
pnpm run --filter @paniere/backend start
```

## 📚 Best Practices

1. **Always build shared package first** when making type changes
2. **Use workspace:\* syntax** for internal package dependencies
3. **Add types to shared package** rather than duplicating across packages
4. **Use pnpm filters** to work with specific packages efficiently
5. **Keep package.json scripts consistent** across packages
6. **Update lockfile** with `pnpm install` after adding dependencies
7. **Extend root tsconfig.json** in all packages - only override package-specific options
8. **Define strict rules once** in root tsconfig, inherit everywhere

## 🆘 Common Issues & Solutions

### "Module not found" errors

```bash
# Ensure shared package is built
pnpm run --filter @paniere/shared build
```

### Type mismatches between packages

```bash
# Check that all packages use the same shared types
pnpm run type-check
```

### Dependency conflicts

```bash
# Check for conflicting versions
pnpm ls --recursive | grep conflicting
```

### Slow builds

```bash
# Clean node_modules and reinstall
pnpm run clean
pnpm install --frozen-lockfile
```

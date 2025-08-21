# Paniere - Current Architecture

## Overview

Paniere is a single-player web application implementing the traditional Neapolitan Tombola game. The application is built as a frontend-only solution with no backend services.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **State Management**: Zustand with local persistence
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Analytics**: Google Analytics (GA4)
- **Hosting**: Netlify (static site)

## Architecture Patterns

### Frontend-Only Architecture

- All game logic runs in the browser
- No server-side components or APIs
- State persisted to localStorage
- No real-time communication capabilities

### State Management

- **Zustand Store** (`useGameStore`):
  - Manages game mode (tabellone/player)
  - Tracks drawn/marked numbers
  - Handles cartelle generation
  - Prize detection logic
  - Persistence with 48-hour expiration

### Game Modes

1. **Tabellone Mode** (Game Master):
   - Controls number drawing
   - Displays all drawn numbers on board
   - Can undo/reset
2. **Player Mode**:
   - Generates 1-10 random cartelle
   - Players manually mark numbers
   - Automatic prize detection
   - Visual celebrations (confetti)

### Key Components

- `StartPage`: Mode selection
- `Tabellone`: Master board display
- `PlayerMode`: Player cartelle view
- `GameControls`: Draw/undo/reset actions
- Various UI components (dialogs, buttons, etc.)

## Current Limitations

1. **No Multiplayer Support**: Each browser instance runs independently
2. **No Real-time Sync**: No way to share game state between devices
3. **No Authentication**: No user accounts or sessions
4. **No Backend**: All logic is client-side only

## Related Documentation

- [Multiplayer Architecture](./multiplayer-architecture.md) - Design for adding real-time multiplayer capabilities
- [Monorepo Strategy](./monorepo-strategy.md) - Strategy for restructuring into a monorepo with backend
- [Multiplayer Technical Design](./multiplayer-technical-design.md) - Detailed implementation guide for multiplayer
- [Backend Technology Analysis](./backend-technology-analysis.md) - Analysis of backend framework options
- [Type Safety Strategy](./type-safety-strategy.md) - Achieving end-to-end type safety without tRPC

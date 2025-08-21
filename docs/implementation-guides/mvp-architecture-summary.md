# MVP Architecture Summary

## Key Architecture Decisions

### Authentication Strategy

- **Hosts**: Must authenticate via Clerk (Google OAuth or Email/Password)
- **Guests**: No authentication required - pure session-based
- **Free Trial**: First game free, tracked via Clerk user metadata
- **Payment**: Required after first game (prepared but not enforced in MVP)

### Host Approval Mechanism (NEW)

- All games require host approval by default
- Guests join a "waiting room" when requesting access
- Host sees real-time list of pending requests
- Host can approve/reject each request individually
- Approved guests immediately join the game
- Rejected guests receive notification and can try another game

### Technology Stack

```
Frontend:
- React + TypeScript + Vite
- Socket.io-client for WebSocket
- Clerk React SDK for authentication
- React Router for navigation

Backend:
- Node.js + Fastify + Socket.io
- Redis for session/game state
- Clerk Node SDK for auth verification
- TypeScript with shared types

Infrastructure (Local):
- Docker Compose for Redis
- MailHog for email testing (optional)
- pnpm workspaces for monorepo
```

### Data Flow

#### Game Creation (Authenticated)

```
1. User clicks "Create Game"
2. Clerk SignIn modal appears (if not authenticated)
3. User authenticates via Google OAuth or Email
4. Backend verifies auth token
5. Backend checks user metadata for game credits
6. If first game → mark as used, create game
7. If paid games available → decrement, create game
8. If no games → show payment required
9. Return game code to host
```

#### Guest Join Flow (with Approval)

```
1. Guest enters 6-character game code
2. Socket connection established (no auth)
3. Guest assigned session ID
4. Join request created in "pending" state
5. Guest enters "waiting room"
6. Host receives real-time notification
7. Host approves/rejects:
   - Approve → Guest joins game room
   - Reject → Guest notified, leaves waiting room
```

### Session Management

```typescript
// Every connection gets a session
Session {
  id: string              // Unique session ID
  playerId: string        // User ID or guest_xxx
  userId?: string         // Clerk user ID (if authenticated)
  isGuest: boolean        // True for unauthenticated
  currentGameId?: string  // Active game
  isHost: boolean         // Host privileges
}
```

### Game State Structure

```typescript
GameState {
  id: string
  code: string                      // 6-char shareable code
  hostId: string                    // Authenticated user ID
  players: Player[]                 // Active players
  pendingJoinRequests: JoinRequest[] // Awaiting approval
  settings: {
    requireHostApproval: boolean   // Always true for MVP
    maxPlayers: number             // Default 10
  }
  status: "waiting" | "active" | "finished"
  drawnNumbers: number[]
}
```

### WebSocket Events

#### Client → Server

- `game:create` - Create new game (auth required)
- `join:request` - Request to join game
- `join:approve` - Host approves request
- `join:reject` - Host rejects request
- `game:start` - Start the game
- `number:draw` - Draw next number
- `cartella:mark` - Mark number on cartella

#### Server → Client

- `join:request` - New join request (to host)
- `join:approved` - Request approved (to guest)
- `join:rejected` - Request rejected (to guest)
- `player:joined` - Player joined game
- `game:updated` - Game state changed
- `number:drawn` - Number was drawn
- `error` - Error occurred

### Security Considerations

1. **Authentication**:
   - Hosts must be authenticated
   - JWT verification on WebSocket connect
   - Guest sessions are ephemeral

2. **Authorization**:
   - Only hosts can approve/reject joins
   - Only hosts can draw numbers
   - Server validates all game actions

3. **Rate Limiting** (TODO):
   - Game creation: 5 per hour per IP
   - Join requests: 10 per minute per session
   - WebSocket connections: 20 per IP

### Payment Flow (Prepared, not enforced)

1. **Metadata Tracking**:

   ```typescript
   user.publicMetadata.subscription = {
     freeGameUsed: boolean,
     gamesRemaining: number,
     lastPurchasedAt?: string,
   }
   ```

2. **Post-Game Prompt**:
   - Shows after first free game ends
   - Non-blocking overlay during game wrap-up
   - One-click purchase if card saved
   - Standard Stripe checkout otherwise

### Local Development Commands

```bash
# Initial setup
pnpm install
pnpm dev:setup    # Starts Docker services

# Development
pnpm dev          # Runs frontend + backend
pnpm dev:frontend # Frontend only
pnpm dev:backend  # Backend only

# Docker management
pnpm docker:up    # Start services
pnpm docker:down  # Stop services
pnpm docker:logs  # View logs

# Testing
redis-cli ping    # Test Redis
curl http://localhost:3001/health  # Test backend
```

### Environment Variables

```bash
# Backend (.env)
PORT=3001
CLIENT_URL=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Frontend (.env)
VITE_BACKEND_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Common Issues During Development

1. **CORS Errors**: Ensure CLIENT_URL matches frontend URL exactly
2. **Auth Failures**: Check Clerk keys and redirect URLs
3. **Redis Connection**: Ensure Docker is running
4. **WebSocket Timeout**: Check firewall/proxy settings
5. **Session Loss**: Verify Redis persistence settings

### Testing the Complete Flow

1. **Host Path**:
   - Create account → Free game → Share code → Approve guests → Play → See payment prompt

2. **Guest Path**:
   - Enter code → Optional name → Wait for approval → Join game → Play

3. **Edge Cases**:
   - Reject guest → Guest can retry
   - Host disconnects → Game pauses (10min timeout)
   - Guest reconnects → Restore state
   - Invalid code → Clear error message

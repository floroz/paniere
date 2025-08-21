# Multiplayer Implementation Guide (Revised)

## Overview

This guide breaks down the multiplayer implementation into small, manageable phases. Each phase can be completed independently and includes a checklist for tracking progress.

## Prerequisites Checklist

- [ ] Monorepo structure set up
- [ ] Frontend and backend packages created
- [ ] TypeScript configured across packages
- [ ] Shared types package functional

## Phase 0: Local Development Environment (1 day)

### 0.1 Docker Setup Checklist

- [ ] Create `docker-compose.yml` for local development
- [ ] Set up Redis container
- [ ] Set up PostgreSQL container (for future use)
- [ ] Create `.env.example` files
- [ ] Test containers are accessible

```yaml
# docker-compose.yml
version: "3.8"
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: paniere
      POSTGRES_PASSWORD: paniere_dev
      POSTGRES_DB: paniere_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

### 0.2 Development Scripts Checklist

- [ ] Add Docker commands to root `package.json`
- [ ] Create startup script for development
- [ ] Document in README

```json
{
  "scripts": {
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "dev:setup": "npm run docker:up && npm install",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

## Phase 1: Basic WebSocket Setup (2 days)

### 1.1 Socket.io Server Setup Checklist

- [ ] Install socket.io in backend
- [ ] Create basic WebSocket server
- [ ] Add CORS configuration
- [ ] Test with simple ping/pong

```bash
cd packages/backend
npm install socket.io @types/socket.io
```

```typescript
// packages/backend/src/server.ts
import Fastify from "fastify";
import { Server } from "socket.io";

const app = Fastify({ logger: true });
const io = new Server(app.server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("ping", (callback) => {
    callback("pong");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

await app.listen({ port: 3000, host: "0.0.0.0" });
```

### 1.2 Socket.io Client Setup Checklist

- [ ] Install socket.io-client in frontend
- [ ] Create socket service
- [ ] Add connection management
- [ ] Test connection to backend

```bash
cd packages/frontend
npm install socket.io-client
```

```typescript
// packages/frontend/src/services/socket.ts
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
      },
    );

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
```

### 1.3 Basic Connection Test Checklist

- [ ] Create test component in frontend
- [ ] Verify WebSocket connection works
- [ ] Test ping/pong functionality
- [ ] Check connection resilience

```typescript
// packages/frontend/src/components/ConnectionTest.tsx
import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';

export function ConnectionTest() {
  const [connected, setConnected] = useState(false);
  const [pingResult, setPingResult] = useState('');

  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const testPing = () => {
    const socket = socketService.getSocket();
    socket?.emit('ping', (response: string) => {
      setPingResult(response);
    });
  };

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={testPing}>Test Ping</button>
      {pingResult && <p>Response: {pingResult}</p>}
    </div>
  );
}
```

## Phase 2: Authentication Integration (2 days)

### 2.1 Auth Provider Setup Checklist (Using Clerk)

- [ ] Sign up for Clerk account
- [ ] Create Clerk application
- [ ] Install Clerk SDK in frontend
- [ ] Install Clerk SDK in backend
- [ ] Configure environment variables

```bash
# Frontend
cd packages/frontend
npm install @clerk/clerk-react

# Backend
cd packages/backend
npm install @clerk/clerk-sdk-node
```

```typescript
// packages/frontend/.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

// packages/backend/.env
CLERK_SECRET_KEY=sk_test_...
```

### 2.2 Frontend Auth Setup Checklist

- [ ] Wrap app with ClerkProvider
- [ ] Create auth components
- [ ] Add sign-in/sign-up UI
- [ ] Test authentication flow

```typescript
// packages/frontend/src/main.tsx
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
```

```typescript
// packages/frontend/src/hooks/useAuth.ts
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

export function useAuth() {
  const { isLoaded, userId, sessionId, getToken } = useClerkAuth();
  const { user } = useUser();

  return {
    isLoading: !isLoaded,
    isAuthenticated: !!userId,
    userId,
    email: user?.primaryEmailAddress?.emailAddress,
    getToken, // For API calls
  };
}
```

### 2.3 Backend Auth Middleware Checklist

- [ ] Create Clerk webhook handler
- [ ] Add auth middleware for protected routes
- [ ] Verify JWT tokens
- [ ] Test authenticated endpoints

```typescript
// packages/backend/src/middleware/auth.ts
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

export const requireAuth = ClerkExpressRequireAuth({
  // No options needed for basic auth
});

// For WebSocket auth
export async function authenticateSocket(socket: Socket, next: Function) {
  const token = socket.handshake.auth.token;

  if (!token) {
    // Allow guest connections
    socket.data.isGuest = true;
    socket.data.guestId = `guest_${socket.id}`;
    return next();
  }

  try {
    const session = await clerkClient.sessions.verifySession(token);
    socket.data.userId = session.userId;
    socket.data.isGuest = false;
    next();
  } catch (error) {
    socket.data.isGuest = true;
    socket.data.guestId = `guest_${socket.id}`;
    next();
  }
}
```

## Phase 3: Redis Session Management (1 day)

### 3.1 Redis Client Setup Checklist

- [ ] Install Redis client (ioredis)
- [ ] Create Redis service wrapper
- [ ] Add connection error handling
- [ ] Test Redis operations

```bash
cd packages/backend
npm install ioredis @types/ioredis
```

```typescript
// packages/backend/src/services/redis.ts
import Redis from "ioredis";

class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on("connect", () => {
      console.log("✅ Connected to Redis");
    });

    this.client.on("error", (err) => {
      console.error("❌ Redis error:", err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }
}

export const redis = new RedisService();
```

### 3.2 Session Manager Checklist

- [ ] Create session data types
- [ ] Implement session creation
- [ ] Add session validation
- [ ] Test session persistence

```typescript
// packages/backend/src/services/sessionManager.ts
import { redis } from "./redis";
import { nanoid } from "nanoid";

interface Session {
  id: string;
  userId?: string;
  guestId?: string;
  isHost: boolean;
  gameId?: string;
  createdAt: Date;
  expiresAt: Date;
}

export class SessionManager {
  private readonly TTL = 24 * 60 * 60; // 24 hours

  async createSession(userId?: string): Promise<Session> {
    const session: Session = {
      id: nanoid(),
      userId,
      guestId: userId ? undefined : `guest_${nanoid()}`,
      isHost: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.TTL * 1000),
    };

    await redis.set(`session:${session.id}`, JSON.stringify(session), this.TTL);

    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<Session>,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const updated = { ...session, ...updates };
    await redis.set(`session:${sessionId}`, JSON.stringify(updated), this.TTL);
  }
}

export const sessionManager = new SessionManager();
```

## Phase 4: Core Game Logic (3 days)

### 4.1 Game State Management Checklist

- [ ] Define game state types in shared package
- [ ] Create game manager service
- [ ] Implement game creation logic
- [ ] Add player join functionality

```typescript
// packages/shared/src/types/game.ts
export interface GameState {
  id: string;
  hostId: string;
  players: Player[];
  status: "waiting" | "active" | "finished";
  drawnNumbers: number[];
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface Player {
  id: string;
  name?: string;
  isHost: boolean;
  connected: boolean;
  cartelle: Cartella[];
}

export interface Cartella {
  id: string;
  numbers: number[][];
  markedNumbers: Set<number>;
}
```

### 4.2 Game Manager Service Checklist

- [ ] Implement game creation
- [ ] Add game joining logic
- [ ] Create number drawing function
- [ ] Add game state persistence

```typescript
// packages/backend/src/services/gameManager.ts
import { redis } from "./redis";
import { nanoid } from "nanoid";
import type { GameState, Player } from "@paniere/shared";

export class GameManager {
  private readonly GAME_TTL = 2 * 60 * 60; // 2 hours

  async createGame(hostId: string): Promise<GameState> {
    const gameId = this.generateGameCode();

    const game: GameState = {
      id: gameId,
      hostId,
      players: [],
      status: "waiting",
      drawnNumbers: [],
      createdAt: new Date(),
    };

    await redis.set(`game:${gameId}`, JSON.stringify(game), this.GAME_TTL);

    return game;
  }

  async joinGame(
    gameId: string,
    playerId: string,
    name?: string,
  ): Promise<Player | null> {
    const game = await this.getGame(gameId);
    if (!game || game.status !== "waiting") {
      return null;
    }

    const player: Player = {
      id: playerId,
      name,
      isHost: playerId === game.hostId,
      connected: true,
      cartelle: this.generateCartelle(3),
    };

    game.players.push(player);
    await this.saveGame(game);

    return player;
  }

  private generateGameCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  private generateCartelle(count: number): Cartella[] {
    // Implementation from original guide
    return [];
  }

  async getGame(gameId: string): Promise<GameState | null> {
    const data = await redis.get(`game:${gameId}`);
    return data ? JSON.parse(data) : null;
  }

  async saveGame(game: GameState): Promise<void> {
    await redis.set(`game:${game.id}`, JSON.stringify(game), this.GAME_TTL);
  }
}

export const gameManager = new GameManager();
```

## Phase 5: WebSocket Game Events (2 days)

### 4.1 Typed Socket.io Setup Checklist

- [ ] Define event types in shared package
- [ ] Create typed server/client interfaces
- [ ] Implement type-safe event handlers
- [ ] Test event communication

```typescript
// packages/shared/src/types/socket.ts
export interface ServerToClientEvents {
  "game:created": (game: GameState) => void;
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "number:drawn": (number: number) => void;
  "game:started": () => void;
  "game:ended": (winner?: Player) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  "game:create": (callback: (response: CreateGameResponse) => void) => void;
  "game:join": (
    data: JoinGameData,
    callback: (response: JoinGameResponse) => void,
  ) => void;
  "game:start": (callback: (response: BaseResponse) => void) => void;
  "number:draw": (callback: (response: DrawNumberResponse) => void) => void;
  "cartella:mark": (data: MarkNumberData) => void;
}

export interface CreateGameResponse {
  success: boolean;
  gameId?: string;
  error?: string;
}

export interface JoinGameData {
  gameId: string;
  playerName?: string;
}
```

### 4.2 Game Event Handlers Checklist

- [ ] Implement create game handler
- [ ] Add join game handler
- [ ] Create number draw handler
- [ ] Add game state sync

```typescript
// packages/backend/src/handlers/gameHandlers.ts
import { TypedSocket, TypedServer } from "../types/socket";
import { gameManager } from "../services/gameManager";
import { sessionManager } from "../services/sessionManager";

export function setupGameHandlers(io: TypedServer, socket: TypedSocket) {
  // Create game (requires authentication)
  socket.on("game:create", async (callback) => {
    try {
      const userId = socket.data.userId;

      // Must be authenticated to create games
      if (!userId) {
        return callback({ success: false, error: "AUTHENTICATION_REQUIRED" });
      }

      // Check if user has available games (free trial or paid)
      const user = await clerkClient.users.getUser(userId);
      const subscription = (user.publicMetadata.subscription as any) || {};

      if (!subscription.freeGameUsed) {
        // First free game
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            subscription: {
              freeGameUsed: true,
              freeGameUsedAt: new Date().toISOString(),
            },
          },
        });
      } else if (!subscription.gamesRemaining) {
        // Requires payment
        return callback({ success: false, error: "PAYMENT_REQUIRED" });
      } else {
        // Decrement games remaining
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            subscription: {
              ...subscription,
              gamesRemaining: subscription.gamesRemaining - 1,
            },
          },
        });
      }

      const game = await gameManager.createGame(userId);

      // Join the socket room
      socket.join(`game:${game.id}`);

      // Update session
      await sessionManager.updateSession(socket.data.sessionId, {
        gameId: game.id,
        isHost: true,
      });

      callback({ success: true, gameId: game.id });
    } catch (error) {
      callback({ success: false, error: "Failed to create game" });
    }
  });

  // Join game (no auth required)
  socket.on("game:join", async (data, callback) => {
    try {
      const playerId = socket.data.userId || socket.data.guestId;

      const player = await gameManager.joinGame(
        data.gameId,
        playerId,
        data.playerName,
      );

      if (!player) {
        return callback({ success: false, error: "Game not found or started" });
      }

      // Join socket room
      socket.join(`game:${data.gameId}`);

      // Notify other players
      socket.to(`game:${data.gameId}`).emit("player:joined", player);

      const game = await gameManager.getGame(data.gameId);
      callback({ success: true, game, player });
    } catch (error) {
      callback({ success: false, error: "Failed to join game" });
    }
  });

  // Draw number (host only)
  socket.on("number:draw", async (callback) => {
    try {
      const session = await sessionManager.getSession(socket.data.sessionId);
      if (!session?.isHost || !session.gameId) {
        return callback({ success: false, error: "Not authorized" });
      }

      const number = await gameManager.drawNumber(session.gameId);
      if (!number) {
        return callback({ success: false, error: "No numbers left" });
      }

      // Broadcast to all players
      io.to(`game:${session.gameId}`).emit("number:drawn", number);

      callback({ success: true, number });
    } catch (error) {
      callback({ success: false, error: "Failed to draw number" });
    }
  });
}

// Game creation eligibility is now handled through Clerk user metadata
// - First game: freeGameUsed = false in metadata
// - Subsequent games: Check gamesRemaining in metadata
// - Payment updates metadata via Stripe webhook
```

## Phase 6: Payment Integration (2 days)

### 6.1 Stripe Setup Checklist

- [ ] Create Stripe account
- [ ] Install Stripe SDK
- [ ] Set up webhook endpoint
- [ ] Create pricing/products in Stripe

```bash
cd packages/backend
npm install stripe
```

### 6.2 Payment Flow Checklist

- [ ] Create checkout endpoint
- [ ] Handle successful payments
- [ ] Update user metadata in Clerk
- [ ] Test payment flow

```typescript
// packages/backend/src/services/stripe.ts
import Stripe from "stripe";
import { clerkClient } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function createCheckoutSession(userId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/game/create?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/pricing`,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  // Get current subscription data
  const user = await clerkClient.users.getUser(userId);
  const currentSub = (user.publicMetadata.subscription as any) || {};

  // Update user metadata in Clerk
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscription: {
        ...currentSub,
        gamesRemaining: (currentSub.gamesRemaining || 0) + 10, // Add to existing
        lastPurchasedAt: new Date().toISOString(),
        paymentMethodId: session.payment_method, // Save for one-click
      },
    },
  });
}
```

## Phase 7: Frontend Game UI (3 days)

### 7.1 Authentication & Game Creation Flow Checklist

- [ ] Implement Clerk SignIn component with Google OAuth prominent
- [ ] Create game creation flow with auth check
- [ ] Add "First game free!" messaging
- [ ] Build game lobby component
- [ ] Add game code display with share functionality
- [ ] Implement player list with live updates

### 7.2 Seamless Payment UX Checklist

- [ ] Create end-game payment prompt component
- [ ] Implement timing logic (show during game wrap-up)
- [ ] Add one-click payment for saved cards
- [ ] Build "Continue Playing" flow
- [ ] Auto-create next game on payment success
- [ ] Add dismissible prompts with smart persistence

```typescript
// Example: Seamless payment component
export function GameEndPaymentPrompt({ gameId, players }) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    setIsProcessing(true);

    // Check if user has saved payment method
    const hasSavedCard = user?.publicMetadata?.subscription?.paymentMethodId;

    if (hasSavedCard) {
      // One-click purchase
      const result = await fetch('/api/quick-purchase', {
        method: 'POST',
        body: JSON.stringify({ priceId: 'price_10_games' })
      });

      if (result.ok) {
        // Auto-create new game
        const newGame = await createGame();
        // Invite same players
        await invitePlayers(newGame.id, players);
        router.push(`/game/${newGame.id}`);
      }
    } else {
      // Redirect to Stripe checkout
      const { url } = await createCheckoutSession();
      window.location.href = url;
    }
  };

  return (
    <div className="payment-prompt-overlay">
      <div className="payment-prompt">
        <h2>That was fun! 🎉</h2>
        <p>Keep the party going with 10 more games</p>
        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className="continue-button"
        >
          {isProcessing ? 'Processing...' : 'Continue for €6.99'}
        </button>
        <button className="dismiss-button">Maybe later</button>
      </div>
    </div>
  );
}
```

### 7.3 Player Experience Checklist

- [ ] Create cartelle display component
- [ ] Add number marking functionality
- [ ] Implement prize claiming
- [ ] Add game status indicators
- [ ] Build responsive player UI (no auth needed)

### 7.4 Responsive Design Checklist

- [ ] Mobile-optimized cartelle view
- [ ] Touch-friendly number marking
- [ ] Landscape/portrait support
- [ ] Performance optimization
- [ ] Auth modals mobile-friendly

## Testing Strategy

### Unit Tests Checklist

- [ ] Game logic tests
- [ ] Session management tests
- [ ] WebSocket event tests
- [ ] Payment flow tests

### Integration Tests Checklist

- [ ] Full game flow test
- [ ] Reconnection scenarios
- [ ] Payment integration
- [ ] Multi-player scenarios

### E2E Tests Checklist

- [ ] Complete user journey
- [ ] Payment flow
- [ ] Error scenarios
- [ ] Performance testing

## Deployment Checklist

### Environment Setup

- [ ] Set up Redis on hosting platform
- [ ] Configure environment variables
- [ ] Set up Clerk in production
- [ ] Configure Stripe webhooks

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring
- [ ] Add custom metrics
- [ ] Set up alerts

## Documentation Checklist

- [ ] API documentation
- [ ] WebSocket event reference
- [ ] Deployment guide
- [ ] Troubleshooting guide

## Next Steps

After completing all phases:

1. Performance optimization
2. Enhanced game features
3. Analytics implementation
4. Marketing website updates

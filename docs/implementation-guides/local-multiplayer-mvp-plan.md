# Local Multiplayer MVP Implementation Plan

## Overview

This plan provides a staged approach to implement a locally working multiplayer Tombola game with:

- Authenticated hosts (with free trial)
- Guest players (no authentication required)
- Host approval mechanism for joining guests
- Payment flow preparation (but not required for local testing)

## End Goal

A working local setup where:

1. An authenticated user can create a game (using their free trial)
2. Share a game code with guests
3. Approve/reject guests before they can join
4. Play a complete multiplayer game
5. See the payment prompt after the free game ends

## Stage 1: Local Development Environment (Day 1)

### Prerequisites

- Node.js 18+ installed
- Docker Desktop installed
- pnpm installed globally

### Tasks

#### 1.1 Docker Services Setup

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
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP server
      - "8025:8025" # Web UI
    environment:
      MH_STORAGE: memory

volumes:
  redis_data:
```

#### 1.2 Environment Configuration

```bash
# .env.local (root)
NODE_ENV=development
REDIS_URL=redis://localhost:6379

# packages/backend/.env
PORT=3001
CLIENT_URL=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
CLERK_SECRET_KEY=sk_test_... # From Clerk dashboard
CLERK_WEBHOOK_SECRET=whsec_... # For local testing

# packages/frontend/.env
VITE_BACKEND_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... # From Clerk dashboard
```

#### 1.3 Development Scripts

```json
// package.json (root)
{
  "scripts": {
    "dev:services": "docker-compose up -d",
    "dev:services:down": "docker-compose down",
    "dev:setup": "pnpm install && pnpm run dev:services",
    "dev": "pnpm run --parallel dev",
    "dev:backend": "pnpm --filter @paniere/backend dev",
    "dev:frontend": "pnpm --filter @paniere/frontend dev"
  }
}
```

### Verification Checklist

- [ ] Docker services running (`docker ps`)
- [ ] Redis accessible (`redis-cli ping`)
- [ ] MailHog UI accessible at http://localhost:8025
- [ ] All environment files created

## Stage 2: Basic WebSocket Infrastructure (Day 2)

### 2.1 Enhanced Type Definitions

```typescript
// packages/shared/src/types/events.ts
export interface ServerToClientEvents {
  // Connection events
  "connection:success": (data: { sessionId: string; playerId: string }) => void;

  // Game events
  "game:created": (game: GameState) => void;
  "game:updated": (game: GameState) => void;

  // Join request events (NEW)
  "join:request": (request: JoinRequest) => void;
  "join:approved": (playerId: string) => void;
  "join:rejected": (playerId: string) => void;

  // Player events
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;

  // Game play events
  "number:drawn": (number: number) => void;
  "prize:claimed": (prize: PrizeClaim) => void;

  // Error events
  error: (error: GameError) => void;
}

export interface ClientToServerEvents {
  // Game creation (requires auth)
  "game:create": (callback: (response: CreateGameResponse) => void) => void;

  // Join flow (NEW)
  "join:request": (
    data: { gameCode: string; playerName?: string },
    callback: (response: JoinRequestResponse) => void,
  ) => void;

  // Host approval (NEW)
  "join:approve": (
    data: { requestId: string },
    callback: (response: BaseResponse) => void,
  ) => void;

  "join:reject": (
    data: { requestId: string },
    callback: (response: BaseResponse) => void,
  ) => void;

  // Game actions
  "game:start": (callback: (response: BaseResponse) => void) => void;
  "number:draw": (callback: (response: DrawResponse) => void) => void;
  "cartella:mark": (data: MarkData) => void;
}

// Join request types (NEW)
export interface JoinRequest {
  id: string;
  playerId: string;
  playerName?: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
}

export interface GameState {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  pendingJoinRequests: JoinRequest[]; // NEW
  settings: {
    requireHostApproval: boolean; // NEW
    maxPlayers: number;
  };
  status: "waiting" | "active" | "finished";
  drawnNumbers: number[];
  createdAt: Date;
}
```

### 2.2 Socket Server with Middleware

```typescript
// packages/backend/src/socket/server.ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from "@paniere/shared";

export type TypedIO = Server<
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

export function createSocketServer(httpServer: any) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Redis adapter for future scaling
  if (process.env.REDIS_URL) {
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const sessionId = socket.handshake.auth.sessionId;

    // Always create or retrieve a session
    let session = sessionId
      ? await sessionManager.getSession(sessionId)
      : await sessionManager.createSession();

    socket.data.sessionId = session.id;
    socket.data.playerId = session.playerId;
    socket.data.isAuthenticated = false;

    // Check for authenticated user
    if (token) {
      try {
        const payload = await verifyClerkToken(token);
        socket.data.userId = payload.sub;
        socket.data.isAuthenticated = true;

        // Update session with user ID
        await sessionManager.updateSession(session.id, { userId: payload.sub });
      } catch (error) {
        console.log("Guest connection - no valid auth token");
      }
    }

    next();
  });

  return io;
}
```

## Stage 3: Authentication Integration (Day 3)

### 3.1 Clerk Setup for Local Development

1. **Create Clerk Application**
   - Sign up at https://clerk.com
   - Create new application
   - Enable Email/Password and Google OAuth
   - Copy API keys to `.env` files

2. **Configure OAuth Redirect URLs**
   ```
   Authorized redirect URLs:
   - http://localhost:5173/game/create
   - http://localhost:5173/sso-callback
   ```

### 3.2 Frontend Auth Components

```typescript
// packages/frontend/src/components/auth/CreateGameAuth.tsx
import { SignIn, useUser, useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function CreateGameAuth() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    if (!user) return;

    setIsCreating(true);
    const token = await getToken();

    try {
      const socket = socketService.connect(token);

      socket.emit("game:create", (response) => {
        if (response.success) {
          navigate(`/game/${response.gameId}/host`);
        } else if (response.error === "PAYMENT_REQUIRED") {
          navigate("/pricing");
        }
      });
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="auth-container">
        <h2>Sign in to create a game</h2>
        <p className="subtitle">Your first game is FREE! 🎉</p>

        <SignIn
          appearance={{
            elements: {
              rootBox: "auth-modal",
              card: "auth-card",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "iconButton",
            }
          }}
          redirectUrl={window.location.href}
        />
      </div>
    );
  }

  const subscription = user.publicMetadata.subscription as any;
  const hasGamesAvailable = !subscription?.freeGameUsed ||
    (subscription?.gamesRemaining > 0);

  return (
    <div className="create-game-container">
      <h2>Welcome back, {user.firstName}!</h2>

      {!subscription?.freeGameUsed && (
        <div className="free-game-banner">
          🎉 Create your first game for FREE!
        </div>
      )}

      {subscription?.gamesRemaining > 0 && (
        <p>Games remaining: {subscription.gamesRemaining}</p>
      )}

      <button
        onClick={handleCreateGame}
        disabled={!hasGamesAvailable || isCreating}
        className="create-game-button"
      >
        {isCreating ? "Creating..." : "Create Game"}
      </button>

      {!hasGamesAvailable && (
        <p className="payment-prompt">
          <a href="/pricing">Get 10 games for €6.99</a>
        </p>
      )}
    </div>
  );
}
```

### 3.3 Backend User Metadata Management

```typescript
// packages/backend/src/services/userService.ts
import { clerkClient } from "@clerk/clerk-sdk-node";

export interface UserSubscription {
  freeGameUsed: boolean;
  freeGameUsedAt?: string;
  gamesRemaining: number;
  lastPurchasedAt?: string;
  totalGamesCreated: number;
}

export class UserService {
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.publicMetadata.subscription as UserSubscription;

    return {
      freeGameUsed: false,
      gamesRemaining: 0,
      totalGamesCreated: 0,
      ...metadata,
    };
  }

  async canCreateGame(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return !subscription.freeGameUsed || subscription.gamesRemaining > 0;
  }

  async consumeGame(userId: string): Promise<void> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription.freeGameUsed) {
      // Use free game
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription: {
            ...subscription,
            freeGameUsed: true,
            freeGameUsedAt: new Date().toISOString(),
            totalGamesCreated: subscription.totalGamesCreated + 1,
          },
        },
      });
    } else if (subscription.gamesRemaining > 0) {
      // Use paid game
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription: {
            ...subscription,
            gamesRemaining: subscription.gamesRemaining - 1,
            totalGamesCreated: subscription.totalGamesCreated + 1,
          },
        },
      });
    } else {
      throw new Error("No games available");
    }
  }
}

export const userService = new UserService();
```

## Stage 4: Redis Session Management (Day 4)

### 4.1 Enhanced Session Manager

```typescript
// packages/backend/src/services/sessionManager.ts
import { Redis } from "ioredis";
import { nanoid } from "nanoid";

export interface Session {
  id: string;
  playerId: string;
  userId?: string; // Clerk user ID if authenticated
  isGuest: boolean;
  currentGameId?: string;
  isHost: boolean;
  createdAt: Date;
  lastActiveAt: Date;
}

export class SessionManager {
  private redis: Redis;
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async createSession(userId?: string): Promise<Session> {
    const session: Session = {
      id: nanoid(),
      playerId: userId || `guest_${nanoid(10)}`,
      userId,
      isGuest: !userId,
      isHost: false,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    await this.saveSession(session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) return null;

    const session = JSON.parse(data);
    // Update last active time
    session.lastActiveAt = new Date();
    await this.saveSession(session);

    return session;
  }

  async saveSession(session: Session): Promise<void> {
    await this.redis.setex(
      `session:${session.id}`,
      this.SESSION_TTL,
      JSON.stringify(session),
    );
  }

  async updateSession(
    sessionId: string,
    updates: Partial<Session>,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const updated = { ...session, ...updates, lastActiveAt: new Date() };
    await this.saveSession(updated);
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }
}
```

### 4.2 Game State Manager

```typescript
// packages/backend/src/services/gameManager.ts
import { Redis } from "ioredis";
import { nanoid } from "nanoid";
import type { GameState, Player, JoinRequest } from "@paniere/shared";

export class GameManager {
  private redis: Redis;
  private readonly GAME_TTL = 4 * 60 * 60; // 4 hours

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async createGame(hostId: string, requireApproval = true): Promise<GameState> {
    const game: GameState = {
      id: nanoid(),
      code: this.generateGameCode(),
      hostId,
      players: [],
      pendingJoinRequests: [],
      settings: {
        requireHostApproval: requireApproval,
        maxPlayers: 10,
      },
      status: "waiting",
      drawnNumbers: [],
      createdAt: new Date(),
    };

    await this.saveGame(game);
    await this.redis.setex(`gameCode:${game.code}`, this.GAME_TTL, game.id);

    return game;
  }

  async getGameByCode(code: string): Promise<GameState | null> {
    const gameId = await this.redis.get(`gameCode:${code}`);
    if (!gameId) return null;

    return this.getGame(gameId);
  }

  async createJoinRequest(
    gameId: string,
    playerId: string,
    playerName?: string,
  ): Promise<JoinRequest> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");

    const request: JoinRequest = {
      id: nanoid(),
      playerId,
      playerName,
      requestedAt: new Date(),
      status: "pending",
    };

    game.pendingJoinRequests.push(request);
    await this.saveGame(game);

    return request;
  }

  async approveJoinRequest(
    gameId: string,
    requestId: string,
    hostId: string,
  ): Promise<Player> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    if (game.hostId !== hostId) throw new Error("Not authorized");

    const request = game.pendingJoinRequests.find((r) => r.id === requestId);
    if (!request || request.status !== "pending") {
      throw new Error("Invalid request");
    }

    // Update request status
    request.status = "approved";

    // Create player
    const player: Player = {
      id: request.playerId,
      name: request.playerName,
      isHost: false,
      connected: true,
      cartelle: this.generateCartelle(3),
      joinedAt: new Date(),
    };

    game.players.push(player);
    await this.saveGame(game);

    return player;
  }

  async rejectJoinRequest(
    gameId: string,
    requestId: string,
    hostId: string,
  ): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    if (game.hostId !== hostId) throw new Error("Not authorized");

    const request = game.pendingJoinRequests.find((r) => r.id === requestId);
    if (!request) throw new Error("Request not found");

    request.status = "rejected";
    await this.saveGame(game);
  }

  private generateGameCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  private generateCartelle(count: number): Cartella[] {
    // Implementation from existing code
    return [];
  }

  async getGame(gameId: string): Promise<GameState | null> {
    const data = await this.redis.get(`game:${gameId}`);
    return data ? JSON.parse(data) : null;
  }

  async saveGame(game: GameState): Promise<void> {
    await this.redis.setex(
      `game:${game.id}`,
      this.GAME_TTL,
      JSON.stringify(game),
    );
  }
}
```

## Stage 5: Core Game Logic with Host Approval (Day 5-6)

### 5.1 WebSocket Event Handlers

```typescript
// packages/backend/src/handlers/gameHandlers.ts
import { TypedIO, TypedSocket } from "../socket/server";
import { gameManager } from "../services/gameManager";
import { sessionManager } from "../services/sessionManager";
import { userService } from "../services/userService";

export function setupGameHandlers(io: TypedIO, socket: TypedSocket) {
  // Create game (requires authentication)
  socket.on("game:create", async (callback) => {
    try {
      const { userId, sessionId } = socket.data;

      if (!userId) {
        return callback({
          success: false,
          error: "AUTHENTICATION_REQUIRED",
        });
      }

      // Check if user can create game
      const canCreate = await userService.canCreateGame(userId);
      if (!canCreate) {
        return callback({
          success: false,
          error: "PAYMENT_REQUIRED",
        });
      }

      // Create game with host approval enabled
      const game = await gameManager.createGame(userId, true);

      // Consume game credit
      await userService.consumeGame(userId);

      // Update session
      await sessionManager.updateSession(sessionId, {
        currentGameId: game.id,
        isHost: true,
      });

      // Join socket room
      socket.join(`game:${game.id}`);

      // Add host as first player
      const hostPlayer: Player = {
        id: userId,
        name: "Host",
        isHost: true,
        connected: true,
        cartelle: gameManager.generateCartelle(3),
        joinedAt: new Date(),
      };

      game.players.push(hostPlayer);
      await gameManager.saveGame(game);

      callback({
        success: true,
        gameId: game.id,
        gameCode: game.code,
      });
    } catch (error) {
      console.error("Create game error:", error);
      callback({
        success: false,
        error: error.message,
      });
    }
  });

  // Request to join game (no auth required)
  socket.on("join:request", async (data, callback) => {
    try {
      const { gameCode, playerName } = data;
      const { playerId, sessionId } = socket.data;

      // Find game by code
      const game = await gameManager.getGameByCode(gameCode);
      if (!game) {
        return callback({
          success: false,
          error: "GAME_NOT_FOUND",
        });
      }

      if (game.status !== "waiting") {
        return callback({
          success: false,
          error: "GAME_ALREADY_STARTED",
        });
      }

      // Check if already in game
      if (game.players.some((p) => p.id === playerId)) {
        return callback({
          success: false,
          error: "ALREADY_IN_GAME",
        });
      }

      // Join waiting room
      socket.join(`game:${game.id}:waiting`);

      if (game.settings.requireHostApproval) {
        // Create join request
        const request = await gameManager.createJoinRequest(
          game.id,
          playerId,
          playerName,
        );

        // Notify host
        io.to(`game:${game.id}`).emit("join:request", request);

        callback({
          success: true,
          status: "PENDING_APPROVAL",
          requestId: request.id,
        });
      } else {
        // Auto-approve if host approval not required
        const player = await gameManager.addPlayer(
          game.id,
          playerId,
          playerName,
        );

        socket.join(`game:${game.id}`);
        socket.leave(`game:${game.id}:waiting`);

        // Update session
        await sessionManager.updateSession(sessionId, {
          currentGameId: game.id,
        });

        // Notify all players
        io.to(`game:${game.id}`).emit("player:joined", player);

        callback({
          success: true,
          status: "JOINED",
          player,
          game,
        });
      }
    } catch (error) {
      console.error("Join request error:", error);
      callback({
        success: false,
        error: error.message,
      });
    }
  });

  // Approve join request (host only)
  socket.on("join:approve", async (data, callback) => {
    try {
      const { requestId } = data;
      const { userId, sessionId } = socket.data;

      const session = await sessionManager.getSession(sessionId);
      if (!session?.isHost || !session.currentGameId) {
        return callback({
          success: false,
          error: "NOT_AUTHORIZED",
        });
      }

      const player = await gameManager.approveJoinRequest(
        session.currentGameId,
        requestId,
        userId,
      );

      // Move player from waiting room to game room
      const playerSocket = [...io.sockets.sockets.values()].find(
        (s) => s.data.playerId === player.id,
      );

      if (playerSocket) {
        playerSocket.leave(`game:${session.currentGameId}:waiting`);
        playerSocket.join(`game:${session.currentGameId}`);

        // Update player session
        await sessionManager.updateSession(playerSocket.data.sessionId, {
          currentGameId: session.currentGameId,
        });
      }

      // Get updated game state
      const game = await gameManager.getGame(session.currentGameId);

      // Notify approved player
      io.to(`game:${session.currentGameId}:waiting`).emit(
        "join:approved",
        player.id,
      );

      // Notify all players in game
      io.to(`game:${session.currentGameId}`).emit("player:joined", player);
      io.to(`game:${session.currentGameId}`).emit("game:updated", game);

      callback({ success: true });
    } catch (error) {
      console.error("Approve join error:", error);
      callback({
        success: false,
        error: error.message,
      });
    }
  });

  // Reject join request (host only)
  socket.on("join:reject", async (data, callback) => {
    try {
      const { requestId } = data;
      const { userId, sessionId } = socket.data;

      const session = await sessionManager.getSession(sessionId);
      if (!session?.isHost || !session.currentGameId) {
        return callback({
          success: false,
          error: "NOT_AUTHORIZED",
        });
      }

      await gameManager.rejectJoinRequest(
        session.currentGameId,
        requestId,
        userId,
      );

      // Get the request to find player ID
      const game = await gameManager.getGame(session.currentGameId);
      const request = game.pendingJoinRequests.find((r) => r.id === requestId);

      if (request) {
        // Notify rejected player
        io.to(`game:${session.currentGameId}:waiting`).emit(
          "join:rejected",
          request.playerId,
        );

        // Remove from waiting room
        const playerSocket = [...io.sockets.sockets.values()].find(
          (s) => s.data.playerId === request.playerId,
        );
        if (playerSocket) {
          playerSocket.leave(`game:${session.currentGameId}:waiting`);
        }
      }

      // Update game state for host
      io.to(`game:${session.currentGameId}`).emit("game:updated", game);

      callback({ success: true });
    } catch (error) {
      console.error("Reject join error:", error);
      callback({
        success: false,
        error: error.message,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    const { sessionId } = socket.data;
    const session = await sessionManager.getSession(sessionId);

    if (session?.currentGameId) {
      const game = await gameManager.getGame(session.currentGameId);
      if (game) {
        // Mark player as disconnected
        const player = game.players.find((p) => p.id === session.playerId);
        if (player) {
          player.connected = false;
          await gameManager.saveGame(game);

          // Notify other players
          socket.to(`game:${game.id}`).emit("player:disconnected", player.id);
        }
      }
    }
  });
}
```

## Stage 6: Frontend UI with Auth & Approval Flow (Day 7-8)

### 6.1 Host Game Management UI

```typescript
// packages/frontend/src/pages/HostGamePage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socketService } from "../services/socket";
import { JoinRequest, GameState, Player } from "@paniere/shared";

export function HostGamePage() {
  const { gameId } = useParams();
  const [game, setGame] = useState<GameState | null>(null);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    const socket = socketService.getSocket();

    // Listen for join requests
    socket.on("join:request", (request) => {
      setPendingRequests(prev => [...prev, request]);
    });

    // Listen for game updates
    socket.on("game:updated", (updatedGame) => {
      setGame(updatedGame);
      setPendingRequests(updatedGame.pendingJoinRequests.filter(
        r => r.status === "pending"
      ));
    });

    socket.on("player:joined", (player) => {
      setGame(prev => ({
        ...prev!,
        players: [...prev!.players, player],
      }));
    });

    return () => {
      socket.off("join:request");
      socket.off("game:updated");
      socket.off("player:joined");
    };
  }, []);

  const handleApprove = async (requestId: string) => {
    const socket = socketService.getSocket();
    socket.emit("join:approve", { requestId }, (response) => {
      if (!response.success) {
        console.error("Failed to approve:", response.error);
      }
    });
  };

  const handleReject = async (requestId: string) => {
    const socket = socketService.getSocket();
    socket.emit("join:reject", { requestId }, (response) => {
      if (!response.success) {
        console.error("Failed to reject:", response.error);
      }
    });
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div className="host-game-container">
      <div className="game-header">
        <h1>Game Code: {game.code}</h1>
        <div className="share-section">
          <p>Share this code with your friends</p>
          <button onClick={() => copyToClipboard(game.code)}>
            Copy Code
          </button>
        </div>
      </div>

      {/* Pending Join Requests */}
      {pendingRequests.length > 0 && (
        <div className="join-requests">
          <h2>Join Requests</h2>
          {pendingRequests.map(request => (
            <div key={request.id} className="join-request-item">
              <span>
                {request.playerName || `Guest ${request.playerId.slice(-4)}`}
              </span>
              <div className="request-actions">
                <button
                  onClick={() => handleApprove(request.id)}
                  className="approve-btn"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Players */}
      <div className="players-section">
        <h2>Players ({game.players.length}/{game.settings.maxPlayers})</h2>
        <div className="players-list">
          {game.players.map(player => (
            <div key={player.id} className="player-item">
              <span className={`player-name ${!player.connected ? 'disconnected' : ''}`}>
                {player.name || `Player ${player.id.slice(-4)}`}
                {player.isHost && " (Host)"}
              </span>
              <span className={`status-indicator ${player.connected ? 'online' : 'offline'}`}>
                {player.connected ? "●" : "○"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        <button
          disabled={game.players.length < 2}
          onClick={startGame}
          className="start-game-btn"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
```

### 6.2 Guest Join Flow

```typescript
// packages/frontend/src/pages/JoinGamePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socketService } from "../services/socket";

export function JoinGamePage() {
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "requesting" | "pending" | "approved" | "rejected" | "error"
  >("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoinRequest = async () => {
    setStatus("requesting");
    setError("");

    const socket = socketService.connect();

    socket.emit("join:request", { gameCode, playerName }, (response) => {
      if (response.success) {
        if (response.status === "PENDING_APPROVAL") {
          setStatus("pending");
          // Listen for approval/rejection
          listenForApproval(socket, response.requestId);
        } else if (response.status === "JOINED") {
          // Auto-approved
          navigate(`/game/${response.game.id}/play`);
        }
      } else {
        setStatus("error");
        setError(response.error || "Failed to join game");
      }
    });
  };

  const listenForApproval = (socket: Socket, requestId: string) => {
    socket.once("join:approved", (approvedPlayerId) => {
      if (approvedPlayerId === socket.id) {
        setStatus("approved");
        // Redirect to game
        setTimeout(() => {
          navigate(`/game/play`);
        }, 1000);
      }
    });

    socket.once("join:rejected", (rejectedPlayerId) => {
      if (rejectedPlayerId === socket.id) {
        setStatus("rejected");
        setError("Your request to join was rejected by the host");
      }
    });
  };

  return (
    <div className="join-game-container">
      <h1>Join a Game</h1>

      {status === "idle" && (
        <form onSubmit={(e) => { e.preventDefault(); handleJoinRequest(); }}>
          <div className="form-group">
            <label>Game Code</label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="ABCD12"
              maxLength={6}
              required
              className="game-code-input"
            />
          </div>

          <div className="form-group">
            <label>Your Name (optional)</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="name-input"
            />
          </div>

          <button type="submit" className="join-btn">
            Join Game
          </button>
        </form>
      )}

      {status === "requesting" && (
        <div className="status-message">
          <div className="spinner" />
          <p>Connecting to game...</p>
        </div>
      )}

      {status === "pending" && (
        <div className="status-message">
          <div className="waiting-icon">⏳</div>
          <h2>Waiting for host approval</h2>
          <p>The host will review your request to join</p>
        </div>
      )}

      {status === "approved" && (
        <div className="status-message success">
          <div className="success-icon">✅</div>
          <h2>Approved!</h2>
          <p>Joining game...</p>
        </div>
      )}

      {status === "rejected" && (
        <div className="status-message error">
          <div className="error-icon">❌</div>
          <h2>Request Rejected</h2>
          <p>{error}</p>
          <button onClick={() => setStatus("idle")} className="retry-btn">
            Try Another Game
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="status-message error">
          <div className="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => setStatus("idle")} className="retry-btn">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
```

## Stage 7: Local Testing & Validation (Day 9)

### 7.1 Testing Scenarios

#### Scenario 1: First-time Host (Free Game)

1. Start all services: `pnpm dev:setup && pnpm dev`
2. Navigate to http://localhost:5173
3. Click "Create Game"
4. Sign up with email or Google
5. Verify "First game free!" message appears
6. Create game successfully
7. Note the 6-character game code

#### Scenario 2: Guest Join with Approval

1. Open new browser/incognito window
2. Navigate to http://localhost:5173/join
3. Enter game code from Scenario 1
4. Enter optional name
5. Submit join request
6. Verify "Waiting for host approval" appears
7. Switch to host window
8. Verify join request appears
9. Click "Approve"
10. Verify guest redirects to game

#### Scenario 3: Guest Rejection

1. Repeat steps 1-6 from Scenario 2
2. In host window, click "Reject"
3. Verify guest sees rejection message
4. Verify guest can try another game

#### Scenario 4: Payment Required (Second Game)

1. As authenticated host, end first game
2. Try to create another game
3. Verify "Payment Required" message
4. Verify redirect to pricing page

### 7.2 Debugging Tools

```typescript
// packages/backend/src/debug/sessionInspector.ts
export async function inspectSession(sessionId: string) {
  const session = await sessionManager.getSession(sessionId);
  console.log("Session:", JSON.stringify(session, null, 2));

  if (session?.currentGameId) {
    const game = await gameManager.getGame(session.currentGameId);
    console.log("Current Game:", JSON.stringify(game, null, 2));
  }
}

// Add to socket connection for debugging
io.on("connection", (socket) => {
  console.log("New connection:", {
    socketId: socket.id,
    sessionId: socket.data.sessionId,
    userId: socket.data.userId,
    isAuthenticated: socket.data.isAuthenticated,
  });
});
```

### 7.3 Common Issues & Solutions

1. **Redis Connection Failed**
   - Ensure Docker is running: `docker ps`
   - Check Redis: `redis-cli ping`

2. **Clerk Authentication Issues**
   - Verify API keys in `.env` files
   - Check Clerk dashboard for errors
   - Ensure redirect URLs are configured

3. **WebSocket Connection Failed**
   - Check CORS settings match frontend URL
   - Verify backend is running on correct port
   - Check browser console for errors

4. **Game Code Not Found**
   - Codes expire after 4 hours
   - Check Redis for key: `redis-cli get gameCode:ABCD12`

## Success Criteria

Your local MVP is complete when:

- [ ] Authenticated user can create a game using free trial
- [ ] Game generates a 6-character shareable code
- [ ] Guests can request to join using the code
- [ ] Host sees join requests in real-time
- [ ] Host can approve/reject each request
- [ ] Approved guests join the game immediately
- [ ] Rejected guests see appropriate message
- [ ] All players can see who's in the game
- [ ] Host can start game with 2+ players
- [ ] After free game, host sees payment prompt

## Next Steps

Once the local MVP is working:

1. **Add Game Mechanics**: Number drawing, cartelle marking, prize detection
2. **Enhance Security**: Rate limiting, input validation, anti-cheat
3. **Improve UX**: Loading states, error handling, animations
4. **Add Payment**: Stripe integration for game purchases
5. **Deploy**: Move from local to production environment

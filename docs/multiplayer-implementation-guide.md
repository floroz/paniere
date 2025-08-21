# Multiplayer Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the multiplayer architecture for Paniere. This assumes you have already set up the monorepo structure as described in the [Monorepo Implementation Guide](./monorepo-implementation-guide.md).

## Prerequisites

- Completed monorepo setup with shared types package
- Backend package initialized with Fastify
- Frontend package with React and Socket.io client

## Phase 1: Core Backend Infrastructure (Days 1-3)

### 1.1 Backend Package Dependencies

```bash
# Navigate to backend package
cd packages/backend

# Install multiplayer dependencies
npm install @fastify/cors @fastify/rate-limit fastify socket.io ioredis nanoid jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

Update `packages/backend/package.json`:

```json
{
  "dependencies": {
    "@paniere/shared": "workspace:*",
    "@fastify/cors": "^10.0.1",
    "@fastify/rate-limit": "^10.1.1",
    "fastify": "^5.2.0",
    "ioredis": "^5.4.1",
    "jsonwebtoken": "^4.2.0",
    "nanoid": "^5.0.9",
    "socket.io": "^4.8.1"
  }
}
```

### 1.2 Environment Configuration

Create `packages/backend/.env.example`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-here

# CORS
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

Create `packages/backend/src/config/env.ts`:

```typescript
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(32),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  RATE_LIMIT_MAX: z.string().default("100"),
  RATE_LIMIT_WINDOW: z.string().default("60000"),
});

export const env = envSchema.parse(process.env);
```

### 1.3 Redis Service Setup

Create `packages/backend/src/services/redis.ts`:

```typescript
import Redis from "ioredis";
import { env } from "../config/env";

export const redis = new Redis(env.REDIS_URL, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

export default redis;
```

### 1.4 Session Management

Create `packages/backend/src/auth/sessionManager.ts`:

```typescript
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { env } from "../config/env";
import redis from "../services/redis";

export interface SessionData {
  sessionId: string;
  playerId: string;
  gameId?: string;
  isMaster: boolean;
  createdAt: number;
  expiresAt: number;
}

export class SessionManager {
  async createSession(isMaster = false): Promise<SessionData> {
    const sessionId = nanoid();
    const playerId = `player_${nanoid()}`;

    const session: SessionData = {
      sessionId,
      playerId,
      isMaster,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Store in Redis
    await redis.setex(
      `session:${sessionId}`,
      86400, // 24 hours
      JSON.stringify(session),
    );

    return session;
  }

  generateToken(session: SessionData): string {
    return jwt.sign(
      {
        sessionId: session.sessionId,
        playerId: session.playerId,
        isMaster: session.isMaster,
      },
      env.JWT_SECRET,
      { expiresIn: "24h" },
    );
  }

  async validateToken(token: string): Promise<SessionData | null> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      const sessionData = await redis.get(`session:${decoded.sessionId}`);

      if (!sessionData) return null;

      return JSON.parse(sessionData);
    } catch (error) {
      return null;
    }
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>,
  ): Promise<void> {
    const sessionData = await redis.get(`session:${sessionId}`);
    if (!sessionData) return;

    const session = { ...JSON.parse(sessionData), ...updates };
    await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session));
  }
}

export const sessionManager = new SessionManager();
```

### 1.5 Game Manager Core

Create `packages/backend/src/game/GameManager.ts`:

```typescript
import { nanoid } from "nanoid";
import redis from "../services/redis";
import type { GameSession, Player, GameState } from "@paniere/shared";
import { generateCartelle } from "../utils/cartelleGenerator";

export interface CreateGameResult {
  success: boolean;
  gameId?: string;
  error?: string;
}

export interface JoinGameResult {
  success: boolean;
  player?: Player;
  gameState?: GameState;
  error?: string;
}

export interface DrawNumberResult {
  success: boolean;
  number?: number;
  drawnNumbers?: number[];
  prizes?: any[];
  error?: string;
}

export class GameManager {
  private generateGameId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  async createGame(masterPlayerId: string): Promise<CreateGameResult> {
    try {
      const gameId = this.generateGameId();

      // Check if game ID already exists
      const existing = await redis.get(`game:${gameId}`);
      if (existing) {
        // Retry with new ID if collision
        return this.createGame(masterPlayerId);
      }

      const gameSession: GameSession = {
        id: gameId,
        masterPlayerId,
        players: [],
        gameState: {
          drawnNumbers: [],
          status: "waiting",
          currentPrizes: [],
        },
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      // Store in Redis with 2-hour expiration
      await redis.setex(
        `game:${gameId}`,
        7200, // 2 hours
        JSON.stringify(gameSession),
      );

      return { success: true, gameId };
    } catch (error) {
      console.error("Failed to create game:", error);
      return { success: false, error: "Failed to create game" };
    }
  }

  async joinGame(
    gameId: string,
    playerId: string,
    playerName?: string,
  ): Promise<JoinGameResult> {
    try {
      const gameData = await redis.get(`game:${gameId}`);
      if (!gameData) {
        return { success: false, error: "GAME_NOT_FOUND" };
      }

      const gameSession: GameSession = JSON.parse(gameData);

      // Check game status
      if (gameSession.gameState.status !== "waiting") {
        return { success: false, error: "GAME_ALREADY_STARTED" };
      }

      // Check player limit
      if (gameSession.players.length >= 10) {
        return { success: false, error: "GAME_FULL" };
      }

      // Check if player already in game
      const existingPlayer = gameSession.players.find((p) => p.id === playerId);
      if (existingPlayer) {
        return {
          success: true,
          player: existingPlayer,
          gameState: gameSession.gameState,
        };
      }

      // Generate cartelle for the player
      const cartelle = generateCartelle(3); // 3 cartelle by default

      const player: Player = {
        id: playerId,
        name: playerName,
        cartelle,
        connected: true,
        joinedAt: new Date(),
        lastSeen: new Date(),
      };

      gameSession.players.push(player);
      gameSession.lastActivity = new Date();

      // Save updated game session
      await redis.setex(`game:${gameId}`, 7200, JSON.stringify(gameSession));

      return {
        success: true,
        player,
        gameState: gameSession.gameState,
      };
    } catch (error) {
      console.error("Failed to join game:", error);
      return { success: false, error: "Failed to join game" };
    }
  }

  async drawNumber(
    gameId: string,
    masterId: string,
  ): Promise<DrawNumberResult> {
    try {
      const gameData = await redis.get(`game:${gameId}`);
      if (!gameData) {
        return { success: false, error: "GAME_NOT_FOUND" };
      }

      const gameSession: GameSession = JSON.parse(gameData);

      // Verify master authority
      if (gameSession.masterPlayerId !== masterId) {
        return { success: false, error: "NOT_AUTHORIZED" };
      }

      // Get available numbers
      const drawnNumbers = gameSession.gameState.drawnNumbers;
      const availableNumbers = Array.from(
        { length: 90 },
        (_, i) => i + 1,
      ).filter((num) => !drawnNumbers.includes(num));

      if (availableNumbers.length === 0) {
        return { success: false, error: "NO_NUMBERS_LEFT" };
      }

      // Draw random number
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const drawnNumber = availableNumbers[randomIndex];

      // Update game state
      gameSession.gameState.drawnNumbers.push(drawnNumber);
      gameSession.gameState.status = "active";
      gameSession.lastActivity = new Date();

      // Save updated game session
      await redis.setex(`game:${gameId}`, 7200, JSON.stringify(gameSession));

      // TODO: Check for prizes

      return {
        success: true,
        number: drawnNumber,
        drawnNumbers: gameSession.gameState.drawnNumbers,
        prizes: [], // TODO: Implement prize checking
      };
    } catch (error) {
      console.error("Failed to draw number:", error);
      return { success: false, error: "Failed to draw number" };
    }
  }

  async getGameState(gameId: string): Promise<GameSession | null> {
    try {
      const gameData = await redis.get(`game:${gameId}`);
      return gameData ? JSON.parse(gameData) : null;
    } catch (error) {
      console.error("Failed to get game state:", error);
      return null;
    }
  }

  async markPlayerDisconnected(
    gameId: string,
    playerId: string,
  ): Promise<void> {
    try {
      const gameData = await redis.get(`game:${gameId}`);
      if (!gameData) return;

      const gameSession: GameSession = JSON.parse(gameData);
      const player = gameSession.players.find((p) => p.id === playerId);

      if (player) {
        player.connected = false;
        player.lastSeen = new Date();

        await redis.setex(`game:${gameId}`, 7200, JSON.stringify(gameSession));
      }
    } catch (error) {
      console.error("Failed to mark player disconnected:", error);
    }
  }

  async markPlayerConnected(gameId: string, playerId: string): Promise<void> {
    try {
      const gameData = await redis.get(`game:${gameId}`);
      if (!gameData) return;

      const gameSession: GameSession = JSON.parse(gameData);
      const player = gameSession.players.find((p) => p.id === playerId);

      if (player) {
        player.connected = true;
        player.lastSeen = new Date();

        await redis.setex(`game:${gameId}`, 7200, JSON.stringify(gameSession));
      }
    } catch (error) {
      console.error("Failed to mark player connected:", error);
    }
  }
}

export const gameManager = new GameManager();
```

### 1.6 Cartelle Generator

Create `packages/backend/src/utils/cartelleGenerator.ts`:

```typescript
import { nanoid } from "nanoid";
import type { Cartella } from "@paniere/shared";

export function generateCartelle(count: number = 3): Cartella[] {
  const cartelle: Cartella[] = [];

  for (let i = 0; i < count; i++) {
    cartelle.push(generateSingleCartella());
  }

  return cartelle;
}

function generateSingleCartella(): Cartella {
  const numbers: number[][] = [];

  // Generate 3 rows of 9 columns each
  for (let row = 0; row < 3; row++) {
    const rowNumbers: number[] = [];
    const usedInRow: boolean[] = new Array(9).fill(false);

    // Each row has exactly 5 numbers
    for (let count = 0; count < 5; count++) {
      let col: number;
      let num: number;

      do {
        col = Math.floor(Math.random() * 9);
      } while (usedInRow[col]);

      usedInRow[col] = true;

      // Generate number based on column (10s)
      if (col === 0) {
        num = Math.floor(Math.random() * 9) + 1; // 1-9
      } else if (col === 8) {
        num = Math.floor(Math.random() * 11) + 80; // 80-90
      } else {
        num = Math.floor(Math.random() * 10) + col * 10; // 10-19, 20-29, etc.
      }

      rowNumbers.push(num);
    }

    // Create full row with zeros for empty positions
    const fullRow = new Array(9).fill(0);
    for (let i = 0; i < 9; i++) {
      if (usedInRow[i]) {
        const numberIndex = rowNumbers.findIndex((n) => {
          if (i === 0) return n >= 1 && n <= 9;
          if (i === 8) return n >= 80 && n <= 90;
          return n >= i * 10 && n < (i + 1) * 10;
        });
        fullRow[i] = rowNumbers[numberIndex];
      }
    }

    numbers.push(fullRow);
  }

  return {
    id: nanoid(),
    numbers,
    markedNumbers: new Set(),
  };
}
```

## Phase 2: WebSocket Implementation (Days 4-6)

### 2.1 Typed Socket.io Server

Create `packages/backend/src/websocket/typed-server.ts`:

```typescript
import { Server, Socket } from "socket.io";
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

export function createTypedServer(httpServer: any): TypedServer {
  return new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(
    httpServer,
    {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
      },
      transports: ["websocket", "polling"],
    },
  );
}
```

### 2.2 Authentication Middleware

Create `packages/backend/src/websocket/middleware/auth.ts`:

```typescript
import { TypedSocket } from "../typed-server";
import { sessionManager } from "../../auth/sessionManager";

export function authenticateSocket(
  socket: TypedSocket,
  next: (err?: Error) => void,
) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication token required"));
  }

  sessionManager
    .validateToken(token)
    .then((session) => {
      if (!session) {
        return next(new Error("Invalid authentication token"));
      }

      // Attach session data to socket
      socket.data = {
        playerId: session.playerId,
        gameId: session.gameId || "",
        isMaster: session.isMaster,
        sessionToken: token,
      };

      next();
    })
    .catch((error) => {
      next(new Error("Authentication failed"));
    });
}
```

### 2.3 Game Event Handlers

Create `packages/backend/src/websocket/handlers/gameHandlers.ts`:

```typescript
import { TypedSocket, TypedServer } from "../typed-server";
import { gameManager } from "../../game/GameManager";
import { sessionManager } from "../../auth/sessionManager";
import {
  createGameSchema,
  joinGameSchema,
  type CreateGameResponse,
  type JoinGameResponse,
} from "@paniere/shared";

export function setupGameHandlers(socket: TypedSocket, io: TypedServer) {
  // Create new game
  socket.on("game:create", async (data, callback) => {
    try {
      const validatedData = createGameSchema.parse(data);

      // Create new session for master
      const session = await sessionManager.createSession(true);
      const token = sessionManager.generateToken(session);

      // Create game
      const result = await gameManager.createGame(session.playerId);

      if (result.success && result.gameId) {
        // Update session with game ID
        await sessionManager.updateSession(session.sessionId, {
          gameId: result.gameId,
        });

        // Join socket room
        socket.join(`game:${result.gameId}`);

        // Update socket data
        socket.data.gameId = result.gameId;
        socket.data.isMaster = true;

        const response: CreateGameResponse = {
          success: true,
          gameId: result.gameId,
          token,
        };

        callback(response);
      } else {
        callback({
          success: false,
          error: result.error || "Failed to create game",
        });
      }
    } catch (error) {
      callback({
        success: false,
        error: "Invalid input data",
      });
    }
  });

  // Join existing game
  socket.on("game:join", async (data, callback) => {
    try {
      const validatedData = joinGameSchema.parse(data);

      // Create new session for player
      const session = await sessionManager.createSession(false);
      const token = sessionManager.generateToken(session);

      // Join game
      const result = await gameManager.joinGame(
        validatedData.gameId,
        session.playerId,
        validatedData.playerName,
      );

      if (result.success) {
        // Update session with game ID
        await sessionManager.updateSession(session.sessionId, {
          gameId: validatedData.gameId,
        });

        // Join socket room
        socket.join(`game:${validatedData.gameId}`);

        // Update socket data
        socket.data.gameId = validatedData.gameId;
        socket.data.isMaster = false;

        // Notify other players
        socket
          .to(`game:${validatedData.gameId}`)
          .emit("player:joined", result.player!);

        const response: JoinGameResponse = {
          success: true,
          token,
          player: result.player,
          gameState: result.gameState,
        };

        callback(response);
      } else {
        callback({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      callback({
        success: false,
        error: "Invalid game ID format",
      });
    }
  });

  // Draw number (master only)
  socket.on("number:draw", async (callback) => {
    if (!socket.data.isMaster) {
      callback({
        success: false,
        error: "Only game master can draw numbers",
      });
      return;
    }

    const result = await gameManager.drawNumber(
      socket.data.gameId,
      socket.data.playerId,
    );

    if (result.success) {
      // Broadcast to all players in game
      io.to(`game:${socket.data.gameId}`).emit("number:drawn", {
        number: result.number!,
        drawnNumbers: result.drawnNumbers!,
        timestamp: Date.now(),
      });

      // Send prize notifications if any
      if (result.prizes && result.prizes.length > 0) {
        result.prizes.forEach((prize) => {
          io.to(`game:${socket.data.gameId}`).emit("prize:won", prize);
        });
      }
    }

    callback(result);
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    if (socket.data.gameId && socket.data.playerId) {
      await gameManager.markPlayerDisconnected(
        socket.data.gameId,
        socket.data.playerId,
      );

      if (socket.data.isMaster) {
        // Master disconnected - pause game
        socket
          .to(`game:${socket.data.gameId}`)
          .emit("game:paused", "Master disconnected");

        // TODO: Implement master timeout logic
      } else {
        // Regular player disconnected
        socket
          .to(`game:${socket.data.gameId}`)
          .emit("player:left", socket.data.playerId);
      }
    }
  });
}
```

### 2.4 Main Server Setup

Update `packages/backend/src/server.ts`:

```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { createTypedServer } from "./websocket/typed-server";
import { authenticateSocket } from "./websocket/middleware/auth";
import { setupGameHandlers } from "./websocket/handlers/gameHandlers";
import { env } from "./config/env";

const app = Fastify({
  logger: env.NODE_ENV === "development",
});

// Register CORS
await app.register(cors, {
  origin: env.CLIENT_URL,
  credentials: true,
});

// Register rate limiting
await app.register(rateLimit, {
  max: parseInt(env.RATE_LIMIT_MAX),
  timeWindow: parseInt(env.RATE_LIMIT_WINDOW),
});

// Health check endpoint
app.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

// Start HTTP server
const server = await app.listen({
  port: parseInt(env.PORT),
  host: "0.0.0.0",
});

// Setup Socket.io
const io = createTypedServer(app.server);

// Authentication middleware
io.use(authenticateSocket);

// Setup event handlers
io.on("connection", (socket) => {
  console.log(`Player ${socket.data.playerId} connected`);

  setupGameHandlers(socket, io);

  // Restore game state on reconnection
  if (socket.data.gameId) {
    socket.join(`game:${socket.data.gameId}`);
    // TODO: Send current game state
  }
});

console.log(`🚀 Server running on port ${env.PORT}`);
```

## Phase 3: Frontend Integration (Days 7-9)

### 3.1 Frontend Dependencies

```bash
# Navigate to frontend package
cd packages/frontend

# Install multiplayer dependencies
npm install socket.io-client
```

### 3.2 Socket Client Service

Create `packages/frontend/src/services/socketClient.ts`:

```typescript
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@paniere/shared";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketClient {
  private socket: TypedSocket | null = null;

  connect(token?: string): TypedSocket {
    this.socket = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
      {
        auth: {
          token: token || localStorage.getItem("gameToken"),
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    );

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Connected to game server");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from game server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });
  }

  getSocket(): TypedSocket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();
```

### 3.3 Multiplayer Store

Create `packages/frontend/src/stores/useMultiplayerStore.ts`:

```typescript
import { create } from "zustand";
import { socketClient, TypedSocket } from "../services/socketClient";
import type {
  GameState,
  Player,
  CreateGameData,
  JoinGameData,
} from "@paniere/shared";

interface MultiplayerState {
  // Connection state
  socket: TypedSocket | null;
  isConnected: boolean;

  // Game state
  gameId: string | null;
  isHost: boolean;
  players: Player[];
  gameState: GameState | null;

  // Actions
  createGame: (data?: CreateGameData) => Promise<string | null>;
  joinGame: (data: JoinGameData) => Promise<boolean>;
  drawNumber: () => Promise<boolean>;
  disconnect: () => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  socket: null,
  isConnected: false,
  gameId: null,
  isHost: false,
  players: [],
  gameState: null,

  createGame: async (data = {}) => {
    const socket = socketClient.connect();
    set({ socket, isConnected: true });

    return new Promise((resolve) => {
      socket.emit("game:create", data, (response) => {
        if (response.success && response.gameId) {
          localStorage.setItem("gameToken", response.token!);
          set({
            gameId: response.gameId,
            isHost: true,
          });
          resolve(response.gameId);
        } else {
          console.error("Failed to create game:", response.error);
          resolve(null);
        }
      });
    });
  },

  joinGame: async (data) => {
    const socket = socketClient.connect();
    set({ socket, isConnected: true });

    return new Promise((resolve) => {
      socket.emit("game:join", data, (response) => {
        if (response.success) {
          localStorage.setItem("gameToken", response.token!);
          set({
            gameId: data.gameId,
            isHost: false,
            gameState: response.gameState || null,
          });

          // Setup event listeners
          setupEventListeners(socket);

          resolve(true);
        } else {
          console.error("Failed to join game:", response.error);
          resolve(false);
        }
      });
    });
  },

  drawNumber: async () => {
    const { socket, isHost } = get();
    if (!socket || !isHost) return false;

    return new Promise((resolve) => {
      socket.emit("number:draw", (response) => {
        if (!response.success) {
          console.error("Failed to draw number:", response.error);
        }
        resolve(response.success);
      });
    });
  },

  disconnect: () => {
    socketClient.disconnect();
    localStorage.removeItem("gameToken");
    set({
      socket: null,
      isConnected: false,
      gameId: null,
      isHost: false,
      players: [],
      gameState: null,
    });
  },
}));

function setupEventListeners(socket: TypedSocket) {
  socket.on("number:drawn", (payload) => {
    useMultiplayerStore.setState((state) => ({
      gameState: state.gameState
        ? {
            ...state.gameState,
            drawnNumbers: payload.drawnNumbers,
          }
        : null,
    }));

    // Update main game store
    // useGameStore.getState().addDrawnNumber(payload.number);
  });

  socket.on("player:joined", (player) => {
    useMultiplayerStore.setState((state) => ({
      players: [...state.players, player],
    }));
  });

  socket.on("player:left", (playerId) => {
    useMultiplayerStore.setState((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    }));
  });

  socket.on("prize:won", (prize) => {
    // Show prize notification
    console.log("Prize won:", prize);
  });

  socket.on("game:paused", (reason) => {
    console.log("Game paused:", reason);
  });

  socket.on("game:ended", (reason) => {
    console.log("Game ended:", reason);
    useMultiplayerStore.getState().disconnect();
  });
}
```

### 3.4 Enhanced Start Page

Update `packages/frontend/src/components/StartPage/StartPage.tsx`:

```tsx
import { useState } from "react";
import { useMultiplayerStore } from "../../stores/useMultiplayerStore";

interface StartPageProps {
  onStart: () => void;
}

export function StartPage({ onStart }: StartPageProps) {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { createGame, joinGame } = useMultiplayerStore();

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const newGameId = await createGame({ masterName: playerName });
      if (newGameId) {
        console.log("Game created:", newGameId);
        onStart();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameId.trim()) return;

    setIsJoining(true);
    try {
      const success = await joinGame({
        gameId: gameId.trim().toUpperCase(),
        playerName: playerName || undefined,
      });

      if (success) {
        onStart();
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="start-page max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Paniere Tombola</h1>

      {/* Player Name Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Your Name (Optional)
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-3 py-2 border rounded-lg"
          maxLength={20}
        />
      </div>

      {/* Multiplayer Section */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Multiplayer Game</h2>

        {/* Create Game */}
        <button
          onClick={handleCreateGame}
          disabled={isCreating}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create New Game"}
        </button>

        {/* Join Game */}
        <div className="space-y-2">
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value.toUpperCase())}
            placeholder="Enter Game ID (6 characters)"
            className="w-full px-3 py-2 border rounded-lg text-center text-lg font-mono"
            maxLength={6}
          />
          <button
            onClick={handleJoinGame}
            disabled={isJoining || gameId.length !== 6}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {isJoining ? "Joining..." : "Join Game"}
          </button>
        </div>
      </div>

      {/* Single Player Option */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Single Player</h2>
        <button
          onClick={onStart}
          className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
        >
          Play Solo
        </button>
      </div>
    </div>
  );
}
```

## Phase 4: Testing and Deployment (Days 10-12)

### 4.1 Local Development Setup

Create development scripts in root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --workspace=@paniere/backend",
    "dev:frontend": "npm run dev --workspace=@paniere/frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### 4.2 Redis Setup (Development)

Using Docker:

```bash
# Start Redis container
docker run -d -p 6379:6379 --name paniere-redis redis:7-alpine

# Or using Redis Cloud (free tier)
# Update REDIS_URL in .env
```

### 4.3 Environment Variables

Backend `.env`:

```bash
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
CLIENT_URL=http://localhost:5173
```

Frontend `.env`:

```bash
VITE_BACKEND_URL=http://localhost:3000
```

### 4.4 Testing Checklist

#### Manual Testing

- [ ] Create game and receive game ID
- [ ] Join game with game ID
- [ ] Draw numbers as master
- [ ] See numbers appear in real-time
- [ ] Test player disconnection/reconnection
- [ ] Test master disconnection
- [ ] Test multiple players (different browsers)

#### Load Testing (Optional)

Create `packages/backend/tests/load-test.js`:

```javascript
// Simple load test with Artillery or similar
// npm install -g artillery
// artillery quick --count 10 -n 20 http://localhost:3000/health
```

### 4.5 Production Deployment

See [ADR 5: Deployment and Hosting Solutions](./adr/005-deployment-hosting-solutions.md) for complete deployment instructions.

#### Quick Railway Deployment

1. Create `packages/backend/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/backend/package*.json ./packages/backend/
RUN npm ci --only=production
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend
EXPOSE $PORT
CMD ["npm", "start", "--workspace=backend"]
```

2. Connect Railway to GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy automatically on push to main

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**

   ```bash
   # Check Redis is running
   redis-cli ping
   # Should return "PONG"
   ```

2. **Socket.io Connection Failed**

   - Check CORS settings in backend
   - Verify environment variables
   - Check browser network tab for errors

3. **TypeScript Errors**

   ```bash
   # Rebuild shared package
   npm run build --workspace=@paniere/shared
   ```

4. **Token Authentication Failed**
   - Check JWT_SECRET is set and consistent
   - Verify token is being sent from frontend
   - Check token expiration

### Development Tips

1. **Use Browser Developer Tools**

   - Network tab for WebSocket connections
   - Console for error messages
   - Application tab for localStorage

2. **Backend Logging**

   ```typescript
   // Add to event handlers for debugging
   console.log("Event received:", eventName, data);
   ```

3. **Redis Debugging**

   ```bash
   # Monitor Redis commands
   redis-cli monitor

   # Check stored data
   redis-cli keys "game:*"
   redis-cli get "game:ABC123"
   ```

## Next Steps

After completing this implementation:

1. **Add Prize Detection**: Implement server-side prize validation
2. **Enhanced UI**: Add game lobby, player list, connection indicators
3. **Error Handling**: Improve error messages and fallback scenarios
4. **Security**: Add rate limiting and input sanitization
5. **Analytics**: Track game metrics and player behavior
6. **Mobile Optimization**: Ensure responsive design works well on mobile

## Related Documentation

- [ADR 6: Multiplayer Architecture Design](./adr/006-multiplayer-architecture-design.md)
- [Monorepo Implementation Guide](./monorepo-implementation-guide.md)
- [ADR 2: Monorepo Architecture and Tooling](./adr/002-monorepo-architecture-and-tooling.md)

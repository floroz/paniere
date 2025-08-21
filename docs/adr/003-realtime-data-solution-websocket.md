# ADR 3: Real-time Data Solution via WebSocket

## Status

Accepted

## Context

The Paniere multiplayer Tombola game requires real-time bidirectional communication to support:

- **Instant number drawing**: Broadcasting drawn numbers to all players simultaneously
- **Real-time prize notifications**: Immediate notification when players win prizes
- **Player state management**: Join/leave events, connection status updates
- **Game state synchronization**: Keeping all clients in sync with current game state
- **Low latency**: Sub-second response times for optimal user experience
- **Scalability**: Support for 1000+ concurrent players across multiple games

### Real-time Communication Options Evaluated

#### 1. WebSocket (Native)

- **Pros**: Browser native, low overhead, full bidirectional communication
- **Cons**: No automatic reconnection, no room management, requires manual implementation of features
- **Assessment**: Too low-level for rapid development

#### 2. Socket.io

- **Pros**: Battle-tested, automatic reconnection, room management, fallback mechanisms, extensive ecosystem
- **Cons**: Slightly higher overhead than native WebSocket, additional abstraction layer
- **Assessment**: Ideal for game development

#### 3. Server-Sent Events (SSE)

- **Pros**: Simple setup, browser native, automatic reconnection
- **Cons**: Unidirectional (server to client only), limited browser support for headers
- **Assessment**: Insufficient for interactive games

#### 4. WebRTC Data Channels

- **Pros**: Peer-to-peer communication, ultra-low latency, no server bandwidth usage
- **Cons**: Complex setup, NAT traversal issues, requires signaling server, not suitable for game state authority
- **Assessment**: Overkill and complex for current needs

#### 5. GraphQL Subscriptions

- **Pros**: Type-safe, integrates with existing GraphQL infrastructure, declarative
- **Cons**: Higher overhead, requires GraphQL setup, less optimal for high-frequency updates
- **Assessment**: Not using GraphQL in the stack

#### 6. Polling/Long Polling

- **Pros**: Simple implementation, works with standard HTTP
- **Cons**: High latency, inefficient resource usage, not real-time
- **Assessment**: Inadequate for real-time games

## Decision

We will use **Socket.io** for real-time WebSocket communication.

### Rationale

1. **Game-Optimized Features**: Built-in room management perfect for game instances
2. **Reliability**: Automatic reconnection and fallback mechanisms ensure connection stability
3. **Developer Experience**: Comprehensive documentation and TypeScript support
4. **Performance**: Optimized for high-frequency bidirectional communication
5. **Ecosystem**: Extensive middleware and plugin ecosystem
6. **Production Proven**: Used by major real-time applications and games

### Architecture Design

#### Server-Side Implementation

```typescript
// backend/src/websocket/gameSocket.ts
import { Server as SocketIOServer } from "socket.io";
import type { TypedIO, TypedSocket } from "./typed-io";

export class GameSocketManager {
  private io: TypedIO;
  private gameRooms = new Map<string, GameRoom>();

  constructor(io: TypedIO) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: TypedSocket) => {
      // Handle game creation
      socket.on("game:create", async (callback) => {
        const game = await this.createGame();
        socket.join(game.id);
        callback({ success: true, gameId: game.id });
      });

      // Handle player joining
      socket.on("game:join", async (gameId, callback) => {
        const result = await this.joinGame(socket, gameId);
        callback(result);
      });

      // Handle number drawing (host only)
      socket.on("number:draw", async (gameId) => {
        const number = await this.drawNumber(gameId);
        // Broadcast to all players in the game room
        this.io.to(gameId).emit("number:drawn", {
          number,
          timestamp: Date.now(),
          gameId,
        });
      });

      // Handle cartella marking
      socket.on("cartella:mark", async (gameId, cartellaId, number) => {
        const prize = await this.markNumber(gameId, cartellaId, number);
        if (prize) {
          this.io.to(gameId).emit("prize:won", {
            playerId: socket.userId,
            prize,
            cartellaId,
          });
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.handlePlayerDisconnect(socket);
      });
    });
  }
}
```

#### Client-Side Implementation

```typescript
// frontend/src/services/gameSocket.ts
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@paniere/shared/types/events";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class GameSocketService {
  private socket: GameSocket;

  constructor() {
    this.socket = io(process.env.VITE_BACKEND_URL, {
      transports: ["websocket"], // Prefer WebSocket over polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle number drawing
    this.socket.on("number:drawn", (payload) => {
      gameStore.addDrawnNumber(payload.number);
      uiStore.showNumberAnimation(payload.number);
    });

    // Handle prize notifications
    this.socket.on("prize:won", (prize) => {
      if (prize.playerId === this.socket.id) {
        confettiStore.trigger();
        toastStore.showSuccess(`You won: ${prize.type}!`);
      } else {
        toastStore.showInfo(`${prize.playerName} won: ${prize.type}`);
      }
    });

    // Handle connection events
    this.socket.on("connect", () => {
      connectionStore.setConnected(true);
    });

    this.socket.on("disconnect", () => {
      connectionStore.setConnected(false);
    });
  }

  // Type-safe event emission
  public createGame(): Promise<GameCreateResponse> {
    return new Promise((resolve) => {
      this.socket.emit("game:create", resolve);
    });
  }

  public joinGame(gameId: string): Promise<JoinResponse> {
    return new Promise((resolve) => {
      this.socket.emit("game:join", gameId, resolve);
    });
  }

  public markCartella(gameId: string, cartellaId: string, number: number) {
    this.socket.emit("cartella:mark", gameId, cartellaId, number);
  }
}
```

### Type Safety Implementation

#### Event Type Definitions

```typescript
// packages/shared/src/types/events.ts
export interface ServerToClientEvents {
  // Game state events
  "game:state": (state: GameState) => void;
  "game:started": (timestamp: number) => void;
  "game:ended": (results: GameResults) => void;

  // Number drawing events
  "number:drawn": (payload: NumberDrawnPayload) => void;
  "numbers:remaining": (count: number) => void;

  // Prize events
  "prize:won": (prize: PrizeNotification) => void;
  "prize:available": (prizes: Prize[]) => void;

  // Player events
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "player:connected": (playerId: string) => void;
  "player:disconnected": (playerId: string) => void;

  // Error events
  error: (error: { message: string; code: string }) => void;
}

export interface ClientToServerEvents {
  // Game management
  "game:create": (callback: (response: GameCreateResponse) => void) => void;
  "game:join": (
    gameId: string,
    callback: (response: JoinResponse) => void,
  ) => void;
  "game:start": (gameId: string) => void;
  "game:end": (gameId: string) => void;

  // Number drawing (host only)
  "number:draw": (gameId: string) => void;

  // Player actions
  "cartella:mark": (gameId: string, cartellaId: string, number: number) => void;
  "cartella:unmark": (
    gameId: string,
    cartellaId: string,
    number: number,
  ) => void;

  // Connection management
  ping: (callback: (response: number) => void) => void;
}

export interface NumberDrawnPayload {
  number: number;
  gameId: string;
  timestamp: number;
  drawnBy: string;
}

export interface PrizeNotification {
  playerId: string;
  playerName: string;
  prize: Prize;
  cartellaId: string;
  timestamp: number;
}
```

### Room Management Strategy

#### Game Room Structure

```typescript
// backend/src/models/GameRoom.ts
export class GameRoom {
  public id: string;
  public hostId: string;
  public players = new Map<string, Player>();
  public state: GameState;
  public drawnNumbers: number[] = [];
  public availableNumbers: number[];

  constructor(hostId: string) {
    this.id = generateGameId();
    this.hostId = hostId;
    this.state = "waiting";
    this.availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  }

  public addPlayer(socket: TypedSocket, playerData: CreatePlayerData) {
    const player = new Player(socket.id, playerData);
    this.players.set(socket.id, player);

    // Join Socket.io room
    socket.join(this.id);

    // Notify other players
    socket.to(this.id).emit("player:joined", player.toJSON());

    return player;
  }

  public removePlayer(socketId: string) {
    const player = this.players.get(socketId);
    if (player) {
      this.players.delete(socketId);

      // Notify other players
      socket.to(this.id).emit("player:left", socketId);

      // End game if host leaves
      if (socketId === this.hostId && this.state === "active") {
        this.endGame();
      }
    }
  }

  public drawNumber(): number | null {
    if (this.availableNumbers.length === 0) return null;

    const randomIndex = Math.floor(
      Math.random() * this.availableNumbers.length,
    );
    const number = this.availableNumbers.splice(randomIndex, 1)[0];
    this.drawnNumbers.push(number);

    return number;
  }
}
```

## Consequences

### Positive

- **Real-time Experience**: Sub-second latency for all game events
- **Reliability**: Automatic reconnection ensures stable connections
- **Scalability**: Room-based architecture supports multiple concurrent games
- **Type Safety**: Full TypeScript support across client-server communication
- **Developer Experience**: Intuitive API and extensive documentation
- **Fallback Support**: Automatic degradation to long-polling if WebSocket fails

### Negative

- **Additional Complexity**: More complex than simple HTTP APIs
- **Connection Management**: Need to handle connection state and cleanup
- **Resource Usage**: Persistent connections consume server resources
- **Testing Complexity**: Integration testing requires WebSocket test setup

### Mitigation Strategies

- Implement comprehensive connection monitoring and health checks
- Use connection pooling and proper cleanup on disconnection
- Implement graceful degradation for network issues
- Create dedicated WebSocket testing utilities
- Monitor connection metrics and implement alerts

## Performance Considerations

### Scalability Targets

- **Concurrent Connections**: 1000+ simultaneous players
- **Games per Server**: 100+ concurrent game rooms
- **Message Throughput**: 10,000+ messages per second
- **Latency**: Sub-100ms for number drawing events

### Optimization Strategies

- Use Redis adapter for horizontal scaling across multiple server instances
- Implement message batching for high-frequency updates
- Use binary protocols for large payloads
- Implement client-side event queuing during reconnection

### Monitoring and Metrics

```typescript
// Performance monitoring
socket.on("connection", (socket) => {
  const startTime = Date.now();

  socket.on("disconnect", () => {
    const duration = Date.now() - startTime;
    metrics.recordConnectionDuration(duration);
  });

  socket.use((event, next) => {
    const start = Date.now();
    next();
    const latency = Date.now() - start;
    metrics.recordEventLatency(event[0], latency);
  });
});
```

## Security Considerations

### Connection Security

- Enable CORS restrictions for production
- Implement rate limiting to prevent abuse
- Validate all incoming events and payloads
- Use authentication middleware for protected events

### Game Integrity

- Validate game state changes on server side
- Implement anti-cheat measures for cartella marking
- Use server-side game logic as source of truth
- Log all game events for audit trails

## Future Enhancements

### Horizontal Scaling

```typescript
// Redis adapter for multi-server scaling
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Advanced Features

- Message persistence for offline players
- Spectator mode with read-only connections
- Voice chat integration via WebRTC
- Advanced reconnection strategies with state recovery

## References

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Socket.io TypeScript Support](https://socket.io/docs/v4/typescript/)
- [WebSocket Protocol Specification](https://tools.ietf.org/html/rfc6455)
- [Real-time Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)

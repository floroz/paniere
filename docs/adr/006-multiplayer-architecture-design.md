# ADR 6: Multiplayer Architecture Design

## Status

In Review

## Context

The Paniere Tombola game requires multiplayer capabilities to support real-time gameplay with 2-10 players per game. The architecture must handle:

- **Real-time Communication**: Instant number drawing broadcasts, prize notifications, player join/leave events
- **Game State Management**: Consistent game state across all connected clients
- **Session Management**: Anonymous sessions with reconnection capabilities
- **Scalability**: Support for 1-10 concurrent games normally, scaling to 1000+ games during peak periods
- **Cost Efficiency**: Pay-per-use pricing model for varying load patterns
- **Security**: Anti-cheat measures and game integrity validation
- **Network Resilience**: Connection drops, master disconnections, and reconnection handling

### Architecture Requirements

#### Core Functionality

- **Game Creation**: Master creates game and receives shareable 6-character game ID
- **Player Joining**: Players join using game ID, receive cartelle automatically
- **Real-time Number Drawing**: Master draws numbers, all players see updates instantly
- **Prize Detection**: Server validates all prize claims, broadcasts notifications
- **Connection Management**: Handle disconnections, reconnections, and master timeouts

#### Performance Targets

- **Concurrent Players**: 1,000+ simultaneous players across multiple games
- **Latency**: Sub-100ms for number drawing events
- **Availability**: 99.9% uptime for MVP, 99.95% for production
- **Scalability**: Auto-scale from 1 server instance to 10+ during peak load

### Technology Options Evaluated

#### Real-time Communication

1. **WebSocket with Socket.io** ✅
   - **Pros**: Purpose-built for real-time games, automatic reconnection, room management, battle-tested
   - **Cons**: Slightly higher overhead than native WebSocket
   - **Assessment**: Ideal for multiplayer games

2. **Server-Sent Events (SSE)**
   - **Pros**: Simple setup, browser native, automatic reconnection
   - **Cons**: Unidirectional only, insufficient for interactive games
   - **Assessment**: Not suitable for bidirectional communication

3. **Native WebSocket**
   - **Pros**: Lowest overhead, browser native
   - **Cons**: No automatic reconnection, no room management, requires manual implementation
   - **Assessment**: Too low-level for rapid development

4. **GraphQL Subscriptions**
   - **Pros**: Type-safe, integrates with GraphQL
   - **Cons**: Higher overhead, less optimal for high-frequency updates
   - **Assessment**: Not using GraphQL in the stack

#### Backend Hosting

1. **Fly.io** ✅
   - **Pros**: Excellent for real-time apps, global edge locations, WebSocket optimized, auto-scaling
   - **Cons**: Smaller company, less mature ecosystem
   - **Assessment**: Excellent choice for real-time applications

2. **Railway** (MVP Alternative)
   - **Pros**: Simple deployment, integrated databases, WebSocket support
   - **Cons**: Less geographic distribution, limited scaling options
   - **Assessment**: Good for MVP, migrate to Fly.io for production

3. **AWS ECS/Lambda**
   - **Pros**: Most comprehensive, unlimited scalability
   - **Cons**: Complex setup, WebSocket limitations with Lambda
   - **Assessment**: Overkill for MVP

#### State Management

1. **Redis** ✅
   - **Pros**: Fast in-memory storage, pub/sub for scaling, excellent for sessions
   - **Cons**: Additional service dependency
   - **Assessment**: Essential for game state and horizontal scaling

2. **In-Memory Only**
   - **Pros**: Simplest implementation
   - **Cons**: No persistence, no horizontal scaling
   - **Assessment**: Not suitable for production

## Decision

We will implement a **cost-effective, scalable multiplayer architecture** using:

### Core Architecture

- **Backend**: Node.js + Fastify + Socket.io
- **State Storage**: Redis for game sessions and pub/sub
- **Hosting**: Railway (MVP) → Fly.io (Production)
- **Database**: PostgreSQL (Supabase) for analytics and game history
- **Frontend**: Enhanced React app with real-time WebSocket integration

### Session Management Strategy

- **Anonymous Sessions**: No registration required, use secure session tokens
- **Game IDs**: 6-character alphanumeric codes for easy sharing
- **Reconnection**: Automatic reconnection with state restoration
- **Master Authority**: Only game creator can draw numbers and control game

### Security Model

- **Server-Side Validation**: All game state changes validated on server
- **Anti-Cheat**: Server calculates all prizes independently
- **Rate Limiting**: Prevent abuse with connection and action limits
- **Session Security**: Cryptographically secure tokens, HTTP-only cookies

## Architecture Design

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Player 1      │     │   Player 2      │     │   Master        │
│   (Browser)     │     │   (Browser)     │     │   (Browser)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │ WebSocket             │ WebSocket             │ WebSocket
         └───────────────────────┴───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Load Balancer         │
                    │   (Fly.io/Railway)      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Node.js Servers       │
                    │   (Auto-scaling)        │
                    │   - Fastify             │
                    │   - Socket.io           │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
     ┌──────────▼──────────┐          ┌──────────▼──────────┐
     │   Redis (Upstash)   │          │  PostgreSQL         │
     │   - Game State      │          │  (Supabase)         │
     │   - Pub/Sub         │          │  - Game History     │
     │   - Sessions        │          │  - Analytics        │
     └─────────────────────┘          └─────────────────────┘
```

### Game Session Model

```typescript
interface GameSession {
  id: string; // 6-character game ID
  masterPlayerId: string; // Master's session ID
  players: Player[]; // Active players (max 10)
  gameState: {
    drawnNumbers: number[];
    startedAt?: Date;
    status: "waiting" | "active" | "paused" | "completed";
  };
  createdAt: Date;
  lastActivity: Date;
}

interface Player {
  id: string; // Session ID
  name?: string; // Optional display name
  cartelle: CartellaData[];
  connected: boolean;
  joinedAt: Date;
  lastSeen: Date;
}
```

### Real-time Event Flow

```typescript
// Server → Client Events
interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
  "number:drawn": (payload: NumberDrawnPayload) => void;
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "prize:won": (prize: PrizeNotification) => void;
  "game:paused": (reason: string) => void;
  "game:ended": (reason: string) => void;
}

// Client → Server Events
interface ClientToServerEvents {
  "game:create": (callback: (response: CreateGameResponse) => void) => void;
  "game:join": (
    gameId: string,
    callback: (response: JoinResponse) => void,
  ) => void;
  "number:draw": () => void;
  "prize:claim": (prize: PrizeType) => void;
}
```

## Security and Anti-Cheat Strategy

### Server Authority Model

- **Master Validation**: Only master can draw numbers, verified by session token
- **Prize Validation**: Server recalculates all prizes based on server-stored cartelle
- **Game State**: Server is single source of truth for all game state
- **Action Validation**: All player actions validated server-side

### Rate Limiting Strategy

```typescript
const rateLimits = {
  gameCreation: { points: 5, duration: 3600 }, // 5 games per hour per IP
  gameActions: { points: 60, duration: 60 }, // 60 actions per minute per session
  connections: { max: 20 }, // 20 connections per IP
};
```

### Connection Management

- **Master Disconnect**: 10-minute timeout before game ends
- **Player Reconnection**: Automatic state restoration on reconnect
- **Game Cleanup**: Automatic cleanup of empty or expired games
- **Connection Monitoring**: Health checks and connection status tracking

## Scaling Strategy

### Normal Load (1-10 games)

- **Infrastructure**: 1 server instance, minimal Redis memory
- **Cost**: ~$5-10/month total
- **Performance**: Sub-50ms latency

### Peak Load (1000 games)

- **Infrastructure**: Auto-scale to 5-10 instances, Redis cluster
- **Cost**: ~$50-100 for 2-day peak period
- **Performance**: Sub-100ms latency maintained

### Horizontal Scaling

```typescript
// Redis adapter for multi-instance scaling
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## Implementation Phases

### Phase 1: Core Multiplayer (2-3 weeks)

- WebSocket server setup with typed events
- Game session management with Redis
- Real-time number drawing and broadcasting
- Prize validation system
- Basic reconnection handling
- Game creation/joining UI

### Phase 2: Robustness (1-2 weeks)

- Enhanced error handling and connection stability
- Comprehensive rate limiting and security measures
- Master disconnect handling with timeout
- Player reconnection flow with state sync
- Monitoring and logging infrastructure

### Phase 3: Scale and Polish (1 week)

- Performance optimization and load testing
- UI/UX improvements for multiplayer experience
- Analytics integration for game metrics
- Production deployment and monitoring setup

## Consequences

### Positive

- **Real-time Experience**: Sub-second latency for all game events
- **Cost Effective**: Pay-per-use scaling aligned with usage patterns
- **Reliable**: Automatic reconnection and connection management
- **Secure**: Server-side validation prevents cheating
- **Scalable**: Horizontal scaling supports growth from 10 to 1000+ games
- **Simple**: Anonymous sessions remove registration friction

### Negative

- **Complexity**: More complex than single-player mode
- **Dependencies**: Requires Redis and WebSocket infrastructure
- **Network Dependent**: Requires stable internet connection
- **Resource Usage**: Persistent connections consume server resources

### Risk Mitigation

- **Connection Monitoring**: Comprehensive health checks and alerts
- **Graceful Degradation**: Fallback to single-player if connection fails
- **State Recovery**: Robust reconnection with missed event replay
- **Resource Limits**: Connection pooling and automatic cleanup
- **Testing**: Comprehensive integration and load testing

## Monitoring and Metrics

### Key Metrics

- **Active Games**: Number of concurrent game sessions
- **Player Connections**: Total active WebSocket connections
- **Event Latency**: Time from event emission to client receipt
- **Connection Stability**: Disconnect/reconnect rates
- **Resource Usage**: Server CPU, memory, and Redis utilization

### Health Checks

- **Service Health**: API and WebSocket endpoint monitoring
- **Database Health**: Redis and PostgreSQL connection status
- **Game State Integrity**: Validation of game state consistency
- **Performance Monitoring**: Latency and throughput tracking

## Future Enhancements

### Advanced Features

- **Spectator Mode**: Watch games without participating
- **Game History**: Full replay functionality and sharing
- **Tournament Mode**: Multi-game competitions
- **Custom Rules**: Different prize configurations

### Technical Improvements

- **Edge Computing**: Deploy game logic closer to players
- **Voice Chat**: WebRTC integration for voice communication
- **Mobile Optimization**: Enhanced mobile experience
- **Advanced Analytics**: Player behavior and game statistics

## References

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Real-time Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
- [WebSocket Best Practices](https://ably.com/blog/websocket-best-practices)
- [Game Server Architecture](https://www.gamesparks.com/blog/game-server-architecture-guide/)

# ADR 1: Backend Framework Choice

## Status

Accepted

## Context

For the Paniere multiplayer Tombola game, we need to select a backend framework that supports:

- **Real-time multiplayer capabilities**: Instant number drawing broadcasts, real-time prize notifications, player join/leave events
- **TypeScript support**: Full-stack type safety across the monorepo
- **WebSocket support**: Bidirectional communication for game events
- **Performance**: Ability to handle 1000+ concurrent games
- **Developer experience**: Fast development and easy maintenance
- **Proven technology**: Battle-tested solutions for MVP confidence

### Technologies Evaluated

#### 1. tRPC (TypeScript Remote Procedure Call)

- **Pros**: Perfect type safety, zero code generation, excellent DX, React Query integration
- **Cons**: No native WebSocket support, designed for request/response patterns, would require hybrid setup
- **Assessment**: Not suitable for real-time requirements without additional complexity

#### 2. Fastify + Socket.io (Current Choice)

- **Pros**: Lightweight HTTP server, battle-tested real-time engine, proven stack, extensive ecosystem
- **Cons**: Less type safety than tRPC (but solvable with shared types)
- **Assessment**: Optimal for real-time games

#### 3. Hono + WebSocket

- **Pros**: Ultra-fast, edge-ready, built-in WebSocket, TypeScript-first
- **Cons**: Less mature ecosystem, no Socket.io (requires manual implementation of features)
- **Assessment**: Interesting but risky for MVP

#### 4. NestJS + Socket.io

- **Pros**: Full framework, first-class WebSocket support, scalable architecture
- **Cons**: Heavyweight, steep learning curve, overkill for MVP
- **Assessment**: Too heavy for current needs

#### 5. Bun + ElysiaJS

- **Pros**: Significantly faster performance, built-in TypeScript, type-safe WebSocket
- **Cons**: Young ecosystem, limited hosting providers, bleeding-edge risk
- **Assessment**: Too risky for production MVP

## Decision

We will use **Fastify + Socket.io** for the backend framework.

### Rationale

1. **Real-time First**: Socket.io is purpose-built for real-time applications and games
2. **Proven Technology**: Both Fastify and Socket.io are battle-tested in production
3. **Performance**: Lightweight and fast, suitable for high-concurrency scenarios
4. **Ecosystem**: Extensive middleware and plugin ecosystem
5. **Time to Market**: No learning curve, enabling faster MVP delivery
6. **Deployment Support**: Well-supported on modern hosting platforms

### Type Safety Strategy

To address the type safety concerns without tRPC, we will implement:

```typescript
// packages/shared/src/types/events.ts
export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
  "number:drawn": (payload: NumberDrawnPayload) => void;
  "prize:won": (prize: PrizeNotification) => void;
}

export interface ClientToServerEvents {
  "game:create": (callback: (response: GameCreateResponse) => void) => void;
  "game:join": (
    gameId: string,
    callback: (response: JoinResponse) => void,
  ) => void;
}

// Full type safety in both frontend and backend
const socket: Socket<ServerToClientEvents, ClientToServerEvents>;
```

## Consequences

### Positive

- Simple architecture with clear separation of concerns
- Faster development and MVP delivery
- Proven scalability for real-time applications
- Strong community support and extensive documentation
- Type safety through shared types package

### Negative

- Less automatic type inference compared to tRPC
- Requires manual maintenance of type definitions
- Two separate communication channels (HTTP + WebSocket)

### Mitigation

- Use shared types package for compile-time type checking
- Implement comprehensive integration tests for WebSocket events
- Document API contracts clearly

## Future Considerations

### Migration Path (Post-MVP)

If enhanced type safety becomes critical:

1. **Phase 1**: Add tRPC for new REST endpoints while keeping Socket.io for real-time
2. **Phase 2**: Gradually migrate game queries to tRPC
3. **Phase 3**: Evaluate tRPC subscriptions for less critical real-time features
4. **Phase 4**: Assess full migration feasibility

### Alternative Future Architecture

For enhanced scalability, consider event-driven architecture with message queues (NATS) for horizontal scaling and event sourcing capabilities.

## References

- [Fastify Documentation](https://www.fastify.io/)
- [Socket.io Documentation](https://socket.io/)
- [TypeScript Socket.io Types](https://socket.io/docs/v4/typescript/)

# ADR 4: Authentication Strategy

## Status

Accepted

## Context

The Paniere multiplayer Tombola game requires an authentication system that supports:

- **Quick game access**: Minimal friction for players to join games
- **Player identification**: Unique identity for game state management
- **Session persistence**: Maintaining player identity across reconnections
- **Host privileges**: Distinguishing game creators from regular players
- **Privacy protection**: No unnecessary personal data collection
- **Social features**: Optional player names and basic profiles
- **Scalability**: Support for 1000+ concurrent players

### Game-Specific Requirements

1. **Casual Gaming**: Players should join games instantly without complex registration
2. **Temporary Sessions**: Game sessions are short-lived (30-60 minutes)
3. **Reconnection Support**: Players should retain their cartelle after disconnect/reconnect
4. **Host Authority**: Game creators need special permissions (draw numbers, start/end games)
5. **Player Tracking**: Track wins/losses within a game session
6. **No Persistence Required**: No need for long-term user accounts initially

### Authentication Approaches Evaluated

#### 1. Guest/Anonymous Authentication

- **Pros**: Zero friction, instant access, privacy-friendly, perfect for casual games
- **Cons**: No persistence across browser sessions, limited social features
- **Assessment**: Ideal for MVP and casual gaming

#### 2. Social OAuth (Google, Facebook, Discord)

- **Pros**: Easy registration, established identity, social features
- **Cons**: Privacy concerns, dependency on third parties, registration friction
- **Assessment**: Good for future enhancement but not MVP

#### 3. Traditional Email/Password

- **Pros**: Full control, permanent accounts, comprehensive profiles
- **Cons**: High registration friction, not suitable for casual games
- **Assessment**: Overkill for current use case

#### 4. Phone Number Authentication

- **Pros**: Quick verification, reduces fake accounts, good for regional games
- **Cons**: Privacy concerns, SMS costs, international complexity
- **Assessment**: Not necessary for MVP

#### 5. Magic Link Authentication

- **Pros**: No passwords, better security, user-friendly
- **Cons**: Requires email, slight friction, dependency on email delivery
- **Assessment**: Good middle ground for future consideration

## Decision

We will implement a **Guest Authentication System** with optional account upgrades for the MVP.

### Core Authentication Strategy

#### Phase 1: Guest Authentication (MVP)

1. **Anonymous Sessions**: Generate unique session IDs for each player
2. **Temporary Profiles**: Optional display names stored in session
3. **Session Persistence**: Use secure HTTP-only cookies and localStorage backup
4. **WebSocket Authentication**: Authenticate Socket.io connections via session tokens

#### Phase 2: Optional Account Creation (Post-MVP)

1. **Progressive Enhancement**: Allow guests to "upgrade" to permanent accounts
2. **Social Login**: Add Google/Discord OAuth for convenience
3. **Data Migration**: Transfer guest session data to permanent accounts

### Implementation Architecture

#### Session Management

```typescript
// packages/shared/src/types/auth.ts
export interface GuestSession {
  sessionId: string;
  playerId: string;
  displayName?: string;
  createdAt: number;
  expiresAt: number;
  gameHistory: GameSessionHistory[];
}

export interface GameSessionHistory {
  gameId: string;
  joinedAt: number;
  role: "host" | "player";
  prizes: Prize[];
}

export interface AuthContext {
  isAuthenticated: boolean;
  session: GuestSession | null;
  isHost: (gameId: string) => boolean;
  canDrawNumbers: (gameId: string) => boolean;
}
```

#### Backend Implementation

```typescript
// backend/src/auth/sessionManager.ts
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export class SessionManager {
  private activeSessions = new Map<string, GuestSession>();

  public createGuestSession(displayName?: string): GuestSession {
    const sessionId = randomUUID();
    const playerId = `guest_${randomUUID()}`;

    const session: GuestSession = {
      sessionId,
      playerId,
      displayName,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      gameHistory: [],
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  public generateSessionToken(session: GuestSession): string {
    return jwt.sign(
      {
        sessionId: session.sessionId,
        playerId: session.playerId,
        type: "guest",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );
  }

  public validateSession(token: string): GuestSession | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return this.activeSessions.get(decoded.sessionId) || null;
    } catch (error) {
      return null;
    }
  }

  public extendSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    }
  }

  public addGameToHistory(
    sessionId: string,
    gameData: GameSessionHistory,
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.gameHistory.push(gameData);
    }
  }
}
```

#### Authentication Middleware

```typescript
// backend/src/middleware/auth.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { SessionManager } from "../auth/sessionManager";

export interface AuthenticatedRequest extends FastifyRequest {
  session: GuestSession;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token =
    request.cookies.sessionToken ||
    request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    // Create new guest session for unauthenticated requests
    const session = sessionManager.createGuestSession();
    const sessionToken = sessionManager.generateSessionToken(session);

    reply.setCookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    (request as AuthenticatedRequest).session = session;
    return;
  }

  const session = sessionManager.validateSession(token);
  if (!session) {
    return reply.status(401).send({ error: "Invalid session" });
  }

  // Extend session on activity
  sessionManager.extendSession(session.sessionId);
  (request as AuthenticatedRequest).session = session;
}
```

#### WebSocket Authentication

```typescript
// backend/src/websocket/authSocket.ts
import { Socket } from "socket.io";
import { SessionManager } from "../auth/sessionManager";

export function authenticateSocket(socket: Socket, next: Function) {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.cookie?.match(/sessionToken=([^;]+)/)?.[1];

  if (!token) {
    return next(new Error("No session token provided"));
  }

  const session = sessionManager.validateSession(token);
  if (!session) {
    return next(new Error("Invalid session token"));
  }

  // Attach session to socket
  (socket as any).session = session;
  socket.playerId = session.playerId;
  socket.join(`player:${session.playerId}`); // Join personal room for direct messages

  next();
}

// Usage in Socket.io setup
io.use(authenticateSocket);

io.on("connection", (socket: AuthenticatedSocket) => {
  console.log(`Player ${socket.session.playerId} connected`);

  socket.on("game:create", async (callback) => {
    const game = await gameManager.createGame(socket.session.playerId);
    // Mark this player as host for this game
    gameManager.setGameHost(game.id, socket.session.playerId);
    callback({ success: true, gameId: game.id });
  });
});
```

#### Frontend Implementation

```typescript
// frontend/src/services/authService.ts
export class AuthService {
  private session: GuestSession | null = null;

  async initializeSession(displayName?: string): Promise<GuestSession> {
    try {
      // Try to restore existing session
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (response.ok) {
        this.session = await response.json();
        return this.session;
      }
    } catch (error) {
      console.log("No existing session found");
    }

    // Create new guest session
    const response = await fetch("/api/auth/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
      credentials: "include",
    });

    this.session = await response.json();
    return this.session;
  }

  async updateDisplayName(displayName: string): Promise<void> {
    if (!this.session) throw new Error("No active session");

    await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
      credentials: "include",
    });

    this.session.displayName = displayName;
  }

  getSession(): GuestSession | null {
    return this.session;
  }

  getPlayerId(): string | null {
    return this.session?.playerId || null;
  }

  isHost(gameId: string): boolean {
    return (
      this.session?.gameHistory.some(
        (game) => game.gameId === gameId && game.role === "host",
      ) || false
    );
  }
}
```

#### React Integration

```typescript
// frontend/src/hooks/useAuth.ts
import { create } from "zustand";
import { AuthService } from "../services/authService";

interface AuthStore {
  session: GuestSession | null;
  isLoading: boolean;
  authService: AuthService;

  initializeAuth: (displayName?: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  isHost: (gameId: string) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  isLoading: true,
  authService: new AuthService(),

  initializeAuth: async (displayName?: string) => {
    set({ isLoading: true });
    try {
      const session = await get().authService.initializeSession(displayName);
      set({ session, isLoading: false });
    } catch (error) {
      console.error("Auth initialization failed:", error);
      set({ isLoading: false });
    }
  },

  updateDisplayName: async (name: string) => {
    await get().authService.updateDisplayName(name);
    set({
      session: { ...get().session!, displayName: name },
    });
  },

  isHost: (gameId: string) => {
    return get().authService.isHost(gameId);
  },
}));

// Component usage
export function useAuth() {
  const { session, isLoading, initializeAuth, updateDisplayName, isHost } =
    useAuthStore();

  useEffect(() => {
    if (!session && !isLoading) {
      initializeAuth();
    }
  }, [session, isLoading, initializeAuth]);

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    playerId: session?.playerId,
    displayName: session?.displayName,
    updateDisplayName,
    isHost,
  };
}
```

## Security Considerations

### Session Security

- **HTTP-Only Cookies**: Prevent XSS attacks on session tokens
- **Secure Transmission**: HTTPS only in production
- **Token Expiration**: 24-hour session lifetime with extension on activity
- **CSRF Protection**: SameSite cookie attribute

### Game Integrity

- **Host Validation**: Verify host permissions on server for privileged actions
- **Session Validation**: Validate all game actions against active sessions
- **Anti-Fraud**: Rate limiting and suspicious activity detection

### Privacy Protection

- **Minimal Data**: Collect only necessary information (display name)
- **Data Retention**: Automatic cleanup of expired sessions
- **Anonymization**: No personal identifiers required

## Performance Considerations

### Session Storage

- **In-Memory Cache**: Fast session lookup with Redis for scalability
- **Session Cleanup**: Automated removal of expired sessions
- **Token Optimization**: Lightweight JWT tokens with minimal payload

### Database Strategy

```typescript
// Future persistent storage (Phase 2)
interface SessionStorage {
  // Redis for active sessions (fast access)
  setActiveSession(sessionId: string, session: GuestSession): Promise<void>;
  getActiveSession(sessionId: string): Promise<GuestSession | null>;

  // Database for permanent accounts (future)
  createAccount(sessionData: GuestSession): Promise<Account>;
  migrateGuestData(sessionId: string, accountId: string): Promise<void>;
}
```

## Future Enhancements

### Phase 2: Account Upgrades

```typescript
// Optional account creation
export interface AccountUpgrade {
  email?: string;
  socialProvider?: "google" | "discord";
  socialId?: string;
  permanentProfile: UserProfile;
  gameStats: PlayerStatistics;
}

// Migration strategy
async function upgradeGuestToAccount(
  sessionId: string,
  upgradeData: AccountUpgrade,
): Promise<Account> {
  const guestSession = await sessionManager.getSession(sessionId);
  const account = await accountManager.createAccount({
    ...upgradeData,
    gameHistory: guestSession.gameHistory,
  });

  await sessionManager.migrateGuestData(sessionId, account.id);
  return account;
}
```

### Phase 3: Social Features

- Friend lists and social connections
- Cross-game statistics and leaderboards
- Tournament participation tracking
- Achievement systems

### Phase 4: Advanced Authentication

- Multi-factor authentication for high-stakes games
- Device fingerprinting for fraud prevention
- Advanced session management with device tracking

## Consequences

### Positive

- **Zero Friction**: Players can join games immediately
- **Privacy Friendly**: No personal data collection required
- **Session Persistence**: Reconnection maintains game state
- **Host Security**: Proper authorization for game management
- **Scalable**: Stateless architecture with session tokens
- **Future Ready**: Clear upgrade path to permanent accounts

### Negative

- **Limited Persistence**: Guest sessions expire after 24 hours
- **No Cross-Device**: Sessions tied to specific browser/device
- **Limited Social Features**: Basic identity limits social interactions
- **Session Management**: Additional complexity for state management

### Mitigation Strategies

- Clear communication about session limitations
- Progressive enhancement to permanent accounts
- Local storage backup for critical game state
- Graceful handling of session expiration

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Session Management Security](https://owasp.org/www-project-cheat-sheets/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Guest User Patterns](https://uxplanet.org/guest-user-experience-patterns-in-mobile-apps-2a8e4e3e5f2)
- [Progressive Authentication](https://auth0.com/blog/progressive-profiling/)

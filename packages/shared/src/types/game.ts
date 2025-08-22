export interface GameSession {
  id: string;
  code: string; // 6-character shareable code
  hostId: string; // Changed from masterPlayerId
  players: Player[];
  pendingJoinRequests: JoinRequest[]; // NEW: Awaiting approval
  settings: GameSettings;
  gameState: GameState;
  createdAt: Date;
  lastActivity: Date;
}

export interface Player {
  id: string;
  name?: string;
  cartelle: Cartella[];
  connected: boolean;
  isHost: boolean; // NEW: Distinguish host from players
  joinedAt: Date;
  lastSeen?: Date;
}

export interface Cartella {
  id: string;
  numbers: number[][];
  markedNumbers: Set<number>;
}

export interface GameState {
  drawnNumbers: number[];
  status: "waiting" | "active" | "paused" | "completed";
  startedAt?: Date;
  finishedAt?: Date;
}

export interface GameSettings {
  requireHostApproval: boolean; // NEW: Host approval required
  maxPlayers: number;
  autoStart: boolean;
}

// NEW: Join request types
export interface JoinRequest {
  id: string;
  playerId: string;
  playerName?: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
}

// NEW: Session types
export interface Session {
  id: string;
  playerId: string;
  userId?: string; // Clerk user ID if authenticated
  isGuest: boolean;
  currentGameId?: string;
  isHost: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

// NEW: User subscription types for game limits
export interface UserSubscription {
  freeGameUsed: boolean;
  freeGameUsedAt?: string;
  gamesRemaining: number;
  lastPurchasedAt?: string;
  totalGamesCreated: number;
}

export type PrizeType = "ambo" | "terno" | "quaterna" | "cinquina" | "tombola";

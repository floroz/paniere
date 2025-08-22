import { GameSession, Player, PrizeType, JoinRequest } from "./game";

export interface ServerToClientEvents {
  // Connection events
  "connection:success": (data: { sessionId: string; playerId: string }) => void;

  // Game events
  "game:created": (game: GameSession) => void;
  "game:updated": (game: GameSession) => void;

  // Join request events (NEW)
  "join:request": (request: JoinRequest) => void;
  "join:approved": (playerId: string) => void;
  "join:rejected": (playerId: string) => void;

  // Player events
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "player:disconnected": (playerId: string) => void;
  "player:reconnected": (playerId: string) => void;

  // Game play events
  "number:drawn": (payload: { number: number; drawnNumbers: number[] }) => void;
  "prize:won": (prize: {
    playerId: string;
    playerName?: string;
    prizeType: PrizeType;
  }) => void;

  // Error events
  error: (error: GameError) => void;
}

export interface ClientToServerEvents {
  // Game creation (requires auth)
  "game:create": (callback: (response: CreateGameResponse) => void) => void;

  // Join flow (NEW)
  "join:request": (
    data: JoinRequestData,
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

// Socket data attached to each connection
export interface SocketData {
  sessionId: string;
  playerId: string;
  userId?: string; // Clerk user ID if authenticated
  isAuthenticated: boolean;
}

// Response types
export interface BaseResponse {
  success: boolean;
  error?: string;
}

export interface CreateGameResponse extends BaseResponse {
  gameId?: string;
  gameCode?: string;
}

export interface JoinRequestData {
  gameCode: string;
  playerName?: string;
}

export interface JoinRequestResponse extends BaseResponse {
  status?: "PENDING_APPROVAL" | "JOINED";
  requestId?: string;
  player?: Player;
  game?: GameSession;
}

export interface DrawResponse extends BaseResponse {
  number?: number;
}

export interface MarkData {
  cartellaId: string;
  number: number;
}

export interface GameError {
  code: string;
  message: string;
}

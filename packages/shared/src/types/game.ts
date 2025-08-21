export interface GameSession {
  id: string;
  masterPlayerId: string;
  players: Player[];
  gameState: GameState;
  createdAt: Date;
  lastActivity: Date;
}

export interface Player {
  id: string;
  name?: string;
  cartelle: Cartella[];
  connected: boolean;
  joinedAt: Date;
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
}

export type PrizeType = "ambo" | "terno" | "quaterna" | "cinquina" | "tombola";

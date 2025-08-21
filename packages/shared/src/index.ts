// Shared types and utilities
// These will be expanded in Phase 2 with proper types and validation

export interface GameState {
  drawnNumbers: number[];
  status: "waiting" | "active" | "paused" | "completed";
  startedAt?: Date;
}

export interface Player {
  id: string;
  name?: string;
  cartelle: unknown[];
  connected: boolean;
  joinedAt: Date;
}

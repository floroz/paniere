import { GameState, Player, PrizeType } from "./game";

export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
  "number:drawn": (payload: { number: number; drawnNumbers: number[] }) => void;
  "player:joined": (player: Player) => void;
  "player:left": (playerId: string) => void;
  "prize:won": (prize: {
    playerId: string;
    playerName?: string;
    prizeType: PrizeType;
  }) => void;
}

export interface ClientToServerEvents {
  "game:create": (
    callback: (response: {
      success: boolean;
      gameId?: string;
      token?: string;
      error?: string;
    }) => void,
  ) => void;

  "game:join": (
    gameId: string,
    callback: (response: {
      success: boolean;
      token?: string;
      player?: Player;
      error?: string;
    }) => void,
  ) => void;

  "number:draw": (
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;
}

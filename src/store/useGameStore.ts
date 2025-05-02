import { create } from "zustand";
import { persist } from "zustand/middleware";

const LOCAL_STORAGE_KEY = "tombola-game"; 

interface GameState {
  drawn: number[];
}

interface GameStateWithActions extends GameState {
  drawNumber: () => void;
  undoLastDraw: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  drawn: [],
};

export const useGameStore = create<GameStateWithActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      drawNumber: () => {
        const { drawn } = get();

        const availableNumbers = Array.from(
          { length: 90 },
          (_, i) => i + 1
        ).filter((num) => !drawn.includes(num));

        if (availableNumbers.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const drawnNumber = availableNumbers[randomIndex];

        set(() => ({
          drawn: [...drawn, drawnNumber],
        }));
      },

      undoLastDraw: () => {
        const { drawn } = get();
        set(() => ({
          drawn: drawn.slice(0, -1),
        }));
      },

      resetGame: () => {
        set({
          ...initialState,
        });
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCartelle, CartellaData } from "../utils/cartelleUtils";

const LOCAL_STORAGE_KEY = "tombola-game"; 

/**
 * Types of prizes in the game
 */
export type PrizeType = 'ambo' | 'terno' | 'quaterna' | 'cinquina';

/**
 * Map of prize types to their required counts
 */
export const PRIZE_COUNTS: Record<PrizeType, number> = {
  ambo: 2,
  terno: 3,
  quaterna: 4,
  cinquina: 5
};

interface GameState {
  drawn: number[];
  prizes: {
    ambo: boolean;
    terno: boolean;
    quaterna: boolean;
    cinquina: boolean;
  };
}

interface GameStateWithActions extends GameState {
  drawNumber: () => void;
  undoLastDraw: () => void;
  resetGame: () => void;
  setPrizeState: (prize: PrizeType, value: boolean) => void;
  checkPrizes: (drawnNumbers: number[]) => void;
}

const initialState: GameState = {
  drawn: [],
  prizes: {
    ambo: false,
    terno: false,
    quaterna: false,
    cinquina: false
  }
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
      
      setPrizeState: (prize: PrizeType, value: boolean) => {
        const { prizes } = get();
        set({
          prizes: {
            ...prizes,
            [prize]: value
          }
        });
      },
      
      checkPrizes: (drawnNumbers: number[]) => {
        const { prizes } = get();
        const cartelle = createCartelle();
        const newPrizes = { ...prizes };
        let prizeDetected = false;
        
        // For each cartella
        cartelle.forEach((cartella: CartellaData) => {
          // For each row in the cartella
          for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            // Get all numbers in this row
            const rowNumbers = cartella.numbers[rowIndex];
            // Count how many drawn numbers are in this row
            const drawnInRow = rowNumbers.filter((num: number) => drawnNumbers.includes(num));
            
            // Check for each prize type
            if (!prizes.cinquina && drawnInRow.length === 5) {
              newPrizes.cinquina = true;
              prizeDetected = true;
            } else if (!prizes.quaterna && drawnInRow.length === 4) {
              newPrizes.quaterna = true;
              prizeDetected = true;
            } else if (!prizes.terno && drawnInRow.length === 3) {
              newPrizes.terno = true;
              prizeDetected = true;
            } else if (!prizes.ambo && drawnInRow.length === 2) {
              newPrizes.ambo = true;
              prizeDetected = true;
            }
          }
        });
        
        // Update prize state if any new prizes were detected
        if (prizeDetected) {
          set({ prizes: newPrizes });
          
          // Alert the user about the new prize(s)
          if (newPrizes.cinquina !== prizes.cinquina) {
            alert('Cinquina! 🎉');
          } else if (newPrizes.quaterna !== prizes.quaterna) {
            alert('Quaterna! 🎉');
          } else if (newPrizes.terno !== prizes.terno) {
            alert('Terno! 🎉');
          } else if (newPrizes.ambo !== prizes.ambo) {
            alert('Ambo! 🎉');
          }
        }
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
    }
  )
);

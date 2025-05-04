import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCartelle, CartellaData } from "../utils/cartelleUtils";
import { PrizeType, usePrizeStore, getPrizeName } from "./usePrizeStore";
import { useLanguageStore } from "./useLanguageStore";

const LOCAL_STORAGE_KEY = "tombola-game";

/**
 * Map of prize types to their required counts
 */
export const PRIZE_COUNTS: Record<PrizeType, number> = {
  ambo: 2,
  terno: 3,
  quaterna: 4,
  cinquina: 5,
  tombola: 15
};

interface GameState {
  drawn: number[];
  prizes: Record<PrizeType, boolean>;
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
    cinquina: false,
    tombola: false
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

        // Clear any previous winning sequences before drawing a new number
        usePrizeStore.getState().clearWinningSequences();
        
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
        let winningPrize: PrizeType | null = null;
        let winningCartellaId = 0;
        let winningRowIndex = 0;
        let winningNumbers: number[] = [];
        
        // Get the current language for toast messages
        const language = useLanguageStore.getState().language;
        const isItalian = language === 'it';
        
        // Clear any previous winning sequences
        if (drawnNumbers.length === 1) {
          usePrizeStore.getState().clearWinningSequences();
        }
        
        // For each cartella
        cartelle.forEach((cartella: CartellaData) => {
          // Check for Tombola (all 15 numbers in a cartella)
          if (!prizes.tombola) {
            // Flatten all numbers in this cartella
            const allCartellaNumbers = cartella.numbers.flat();
            // Count how many drawn numbers are in this cartella
            const drawnInCartella = allCartellaNumbers.filter((num: number) => drawnNumbers.includes(num));
            
            if (drawnInCartella.length === 15) {
              newPrizes.tombola = true;
              prizeDetected = true;
              winningPrize = 'tombola';
              winningCartellaId = cartella.id;
              winningNumbers = drawnInCartella;
            }
          }
          
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
              winningPrize = 'cinquina';
              winningCartellaId = cartella.id;
              winningRowIndex = rowIndex;
              winningNumbers = drawnInRow;
            } else if (!prizes.quaterna && drawnInRow.length === 4) {
              newPrizes.quaterna = true;
              prizeDetected = true;
              winningPrize = 'quaterna';
              winningCartellaId = cartella.id;
              winningRowIndex = rowIndex;
              winningNumbers = drawnInRow;
            } else if (!prizes.terno && drawnInRow.length === 3) {
              newPrizes.terno = true;
              prizeDetected = true;
              winningPrize = 'terno';
              winningCartellaId = cartella.id;
              winningRowIndex = rowIndex;
              winningNumbers = drawnInRow;
            } else if (!prizes.ambo && drawnInRow.length === 2) {
              newPrizes.ambo = true;
              prizeDetected = true;
              winningPrize = 'ambo';
              winningCartellaId = cartella.id;
              winningRowIndex = rowIndex;
              winningNumbers = drawnInRow;
            }
          }
        });
        
        // Update prize state if any new prizes were detected
        if (prizeDetected && winningPrize) {
          // Update game store prize state
          set({ prizes: newPrizes });
          
          // We don't need to get row numbers here as we're using winningNumbers directly
            
          // Add the winning sequence to the prize store
          usePrizeStore.getState().addWinningSequence({
            cartellaId: winningCartellaId,
            rowIndex: winningRowIndex,
            numbers: winningNumbers,
            prize: winningPrize
          });
          
          // Set the last prize won for highlighting
          usePrizeStore.getState().setLastPrizeWon(winningPrize);
          
          // Show toast notification
          const prizeName = getPrizeName(winningPrize, isItalian ? 'it' : 'en');
          const message = isItalian 
            ? `${prizeName}! Cartella ${winningCartellaId}` 
            : `${prizeName}! Cartella ${winningCartellaId}`;
          
          usePrizeStore.getState().showToast(message);
          
          // Show confetti
          usePrizeStore.getState().showConfetti();
          
          // Hide confetti after 3 seconds
          setTimeout(() => {
            usePrizeStore.getState().hideConfetti();
          }, 3000);
        }
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
    }
  )
);

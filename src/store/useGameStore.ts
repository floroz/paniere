import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCartelle, CartellaData, generateRandomCartelle } from "../utils/cartelleUtils";
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

/**
 * Available game modes
 */
export type GameMode = 'tabellone' | 'player' | null;

/**
 * Unified game state for both Tabellone and Player modes
 */
interface GameState {
  // Common properties
  gameMode: GameMode;
  
  // Shared game state (for both modes)
  cartelle: CartellaData[];   // Includes both tabellone cartelle and player cartelle
  drawnNumbers: number[];     // In tabellone mode: numbers drawn; in player mode: marked numbers
  prizes: Record<PrizeType, boolean>; // Shared prize tracking for both modes
}

/**
 * Game state with actions for both modes
 */
interface GameStateWithActions extends GameState {
  // Mode management actions
  setGameMode: (mode: GameMode) => void;
  
  // Shared actions for both modes
  toggleNumber: (number: number) => void;   // Draw in tabellone mode, mark in player mode
  undoLastNumber: () => void;               // Undo last action in either mode
  checkPrizes: (numbers?: number[]) => void;  // Prize detection for either mode
  
  // Player mode specific actions
  markNumber: (number: number) => void;     // Mark a number in player mode
  unmarkNumber: (number: number) => void;   // Unmark a number in player mode
  
  // Cartelle management
  generateCartelle: (count: number) => void;
  
  // Backward compatibility actions (redirects to new unified methods)
  drawNumber: () => void;        // Redirects to toggleNumber for tabellone mode
  undoLastDraw: () => void;      // Redirects to undoLastNumber for compatibility
  
  // Session management
  resetGame: () => void;
  returnToStartPage: () => void;
  setPrizeState: (prize: PrizeType, value: boolean) => void;
}

/**
 * Initial state with no game mode selected
 */
const initialState: GameState = {
  gameMode: null,
  cartelle: [],
  drawnNumbers: [],
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

      /**
       * Set the current game mode (tabellone or player)
       */
      setGameMode: (mode: GameMode) => {
        set({ gameMode: mode });
      },

      /**
       * Generate cartelle based on the game mode
       * - For tabellone: Create standard 6 cartelle layout
       * - For player: Generate random cartelle with count
       */
      generateCartelle: (count: number) => {
        const { gameMode } = get();
        let cartelle: CartellaData[];

        if (gameMode === 'tabellone') {
          // In tabellone mode, we always create the standard layout
          cartelle = createCartelle();
        } else if (gameMode === 'player') {
          // In player mode, we generate random cartelle with the specified count
          cartelle = generateRandomCartelle(count);
        } else {
          // If no mode is selected, return early
          return;
        }

        set({ cartelle });
      },

      /**
       * Toggle a number (draw in tabellone mode, mark in player mode)
       */
      toggleNumber: (number: number) => {
        const { drawnNumbers } = get();

        // If the number is already marked/drawn, do nothing
        if (drawnNumbers.includes(number)) return;

        // Clear any previous winning sequences
        usePrizeStore.getState().clearWinningSequences();
        
        // Add the number to drawn/marked numbers
        set({ 
          drawnNumbers: [...drawnNumbers, number]
        });

        // Check for prizes with the updated numbers
        get().checkPrizes();
      },

      /**
       * Undo the last drawn/marked number and invalidate any prizes that were triggered by it
       */
      undoLastNumber: () => {
        const { drawnNumbers } = get();
        
        if (drawnNumbers.length === 0) return;
        
        // Simply remove the last drawn number
        const previousDrawnNumbers = drawnNumbers.slice(0, -1);
        
        // Update the drawn numbers
        set({
          drawnNumbers: previousDrawnNumbers
        });
        
        // Reset all prizes to false
        set({
          prizes: {
            ambo: false,
            terno: false,
            quaterna: false,
            cinquina: false,
            tombola: false
          }
        });
        
        // Clear any previous winning sequences
        usePrizeStore.getState().clearWinningSequences();
        
        // Re-check prizes with the updated numbers
        // This will detect any prizes that are still valid and update the UI accordingly
        get().checkPrizes();
      },
      
      /**
       * Mark a specific number in player mode
       */
      markNumber: (number: number) => {
        const { drawnNumbers, gameMode } = get();
        
        // Only allow marking in player mode
        if (gameMode !== 'player') return;
        
        // If the number is already marked, do nothing
        if (drawnNumbers.includes(number)) return;
        
        // Clear any previous winning sequences
        usePrizeStore.getState().clearWinningSequences();
        
        // Add the number to marked numbers
        set({ 
          drawnNumbers: [...drawnNumbers, number]
        });
        
        // Check for prizes with the updated numbers
        get().checkPrizes();
      },
      
      /**
       * Unmark a specific number in player mode
       */
      unmarkNumber: (number: number) => {
        const { drawnNumbers, gameMode } = get();
        
        // Only allow unmarking in player mode
        if (gameMode !== 'player') return;
        
        // If the number is not marked, do nothing
        if (!drawnNumbers.includes(number)) return;
        
        // Clear any previous winning sequences
        usePrizeStore.getState().clearWinningSequences();
        
        // Remove the number from marked numbers
        set({
          drawnNumbers: drawnNumbers.filter(n => n !== number)
        });
        
        // Re-check prizes with the updated numbers
        get().checkPrizes();
      },

      /**
       * Reset the current game (keeping the same mode)
       */
      resetGame: () => {
        const { gameMode, cartelle } = get();
        
        // Reset to initial state but keep the same game mode and cartelle
        set({
          ...initialState,
          gameMode,
          cartelle
        });

        // Also reset the prize store
        usePrizeStore.getState().clearWinningSequences();
        usePrizeStore.getState().setLastPrizeWon(null);
      },

      /**
       * Return to the start page by clearing the game mode
       */
      returnToStartPage: () => {
        set({
          ...initialState
        });
      },
      
      /**
       * Set the state of a specific prize
       */
      setPrizeState: (prize: PrizeType, value: boolean) => {
        const { prizes } = get();
        set({
          prizes: {
            ...prizes,
            [prize]: value
          }
        });
      },
      
      /**
       * Check for prizes based on the drawn/marked numbers
       */
      checkPrizes: (numbers?: number[]) => {
        const { prizes, drawnNumbers, cartelle } = get();
        // Use provided numbers or fall back to current state
        const numbersToCheck = numbers || drawnNumbers;
        
        if (numbersToCheck.length === 0) return;
        
        const newPrizes = { ...prizes };
        let prizeDetected = false;
        let winningPrize: PrizeType | null = null;
        let winningCartellaId = 0;
        let winningRowIndex = 0;
        let winningNumbers: number[] = [];
        
        // Get the current language for toast messages
        const language = useLanguageStore.getState().language;
        const isItalian = language === 'it';
        
        // For each cartella
        cartelle.forEach((cartella: CartellaData) => {
          // Check for Tombola (all 15 numbers in a cartella)
          if (!prizes.tombola) {
            // Flatten all numbers in this cartella (excluding zeros)
            const allCartellaNumbers = cartella.numbers.flat().filter(num => num !== 0);
            // Count how many drawn numbers are in this cartella
            const drawnInCartella = allCartellaNumbers.filter(num => numbersToCheck.includes(num));
            
            if (drawnInCartella.length === allCartellaNumbers.length) {
              newPrizes.tombola = true;
              prizeDetected = true;
              winningPrize = 'tombola';
              winningCartellaId = cartella.id;
              winningNumbers = drawnInCartella;
            }
          }
          
          // For each row in the cartella
          for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            // Get all numbers in this row (exclude zeros/empty spaces)
            const rowNumbers = cartella.numbers[rowIndex].filter(num => num !== 0);
            if (rowNumbers.length === 0) continue;
            
            // Count how many drawn numbers are in this row
            const drawnInRow = rowNumbers.filter(num => numbersToCheck.includes(num));
            
            // Check for each prize type (based on percentage of row completed)
            if (!prizes.cinquina && rowNumbers.length === 5 && drawnInRow.length === 5) {
              newPrizes.cinquina = true;
              prizeDetected = true;
              winningPrize = 'cinquina';
              winningCartellaId = cartella.id;
              winningRowIndex = rowIndex;
              winningNumbers = drawnInRow;
            } else if (!prizes.quaterna && rowNumbers.length >= 4 && drawnInRow.length >= 4) {
              newPrizes.quaterna = true;
              prizeDetected = true;
              winningPrize = 'quaterna';
              winningCartellaId = cartella.id;
              winningRowIndex = rowIndex;
              winningNumbers = drawnInRow;
            } else if (!prizes.terno && rowNumbers.length >= 3 && drawnInRow.length >= 3) {
              newPrizes.terno = true;
              prizeDetected = true;
              winningPrize = 'terno';
              winningCartellaId = cartella.id;
              winningRowIndex = rowIndex;
              winningNumbers = drawnInRow;
            } else if (!prizes.ambo && rowNumbers.length >= 2 && drawnInRow.length >= 2) {
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

      /**
       * Legacy support: redirect to toggleNumber
       */
      drawNumber: () => {
        const { gameMode, drawnNumbers } = get();
        if (gameMode !== 'tabellone') return;

        // Find an available number to draw
        const availableNumbers = Array.from(
          { length: 90 },
          (_, i) => i + 1
        ).filter(num => !drawnNumbers.includes(num));

        if (availableNumbers.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const drawnNumber = availableNumbers[randomIndex];

        // Use the unified toggleNumber method
        get().toggleNumber(drawnNumber);
      },

      /**
       * Legacy support: redirect to undoLastNumber
       */
      undoLastDraw: () => {
        get().undoLastNumber();
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
    }
  )
);

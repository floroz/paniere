import { create } from "zustand";

export type PrizeType = "ambo" | "terno" | "quaterna" | "cinquina" | "tombola";

interface WinningSequence {
  cartellaId: number;
  rowIndex: number;
  numbers: number[];
  prize: PrizeType;
}

interface PrizeState {
  // Track winning sequences with their numbers
  winningSequences: WinningSequence[];
  // Toast visibility and message
  toastMessage: string;
  isToastVisible: boolean;
  // Confetti visibility
  isConfettiActive: boolean;
  // Last prize won for highlighting
  lastPrizeWon: PrizeType | null;
}

interface PrizeStateWithActions extends PrizeState {
  addWinningSequence: (sequence: WinningSequence) => void;
  clearWinningSequences: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  showConfetti: () => void;
  hideConfetti: () => void;
  setLastPrizeWon: (prize: PrizeType | null) => void;
}

const initialState: PrizeState = {
  winningSequences: [],
  toastMessage: "",
  isToastVisible: false,
  isConfettiActive: false,
  lastPrizeWon: null,
};

export const usePrizeStore = create<PrizeStateWithActions>()((set) => ({
  ...initialState,

  addWinningSequence: (sequence) =>
    set((state) => ({
      winningSequences: [...state.winningSequences, sequence],
    })),

  clearWinningSequences: () =>
    set({
      winningSequences: [],
    }),

  showToast: (message) =>
    set({
      toastMessage: message,
      isToastVisible: true,
    }),

  hideToast: () =>
    set({
      isToastVisible: false,
    }),

  showConfetti: () =>
    set({
      isConfettiActive: true,
    }),

  hideConfetti: () =>
    set({
      isConfettiActive: false,
    }),

  setLastPrizeWon: (prize) =>
    set({
      lastPrizeWon: prize,
    }),
}));

// Helper to translate prize types to Italian
export const getPrizeName = (
  prize: PrizeType,
  language: "en" | "it",
): string => {
  const prizeNames: {
    en: Record<PrizeType, string>;
    it: Record<PrizeType, string>;
  } = {
    en: {
      ambo: "Ambo",
      terno: "Terno",
      quaterna: "Quaterna",
      cinquina: "Cinquina",
      tombola: "Tombola",
    },
    it: {
      ambo: "Ambo",
      terno: "Terno",
      quaterna: "Quaterna",
      cinquina: "Cinquina",
      tombola: "Tombola",
    },
  };

  return prizeNames[language][prize];
};

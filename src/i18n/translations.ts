import { Language } from "../store/useLanguageStore";

type TranslationKeys = {
  startGame: string;
  newGame: string;
  language: string;
  english: string;
  italian: string;
  draw: string;
  undo: string;
  reset: string;
  lastDraws: string;
  last: string;
  close: string;
};

type Translations = {
  [key in Language]: TranslationKeys;
};

export const translations: Translations = {
  en: {
    startGame: "Start Game",
    newGame: "New Game",
    language: "Language",
    english: "English",
    italian: "Italian",
    draw: "Draw",
    undo: "Undo",
    reset: "Reset",
    lastDraws: "Last Draws",
    last: "Last",
    close: "Close",
  },
  it: {
    startGame: "Inizia Gioco",
    newGame: "Nuovo Gioco",
    language: "Lingua",
    english: "Inglese",
    italian: "Italiano",
    draw: "Estrai",
    undo: "Annulla",
    reset: "Azzera",
    lastDraws: "Ultime Estrazioni",
    last: "Ultimo",
    close: "Chiudi",
  },
};

export const useTranslations = (language: Language) => {
  return translations[language];
};

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
  remaining: string;
  confirm: string;
  cancel: string;
  undoConfirmMessage: string;
  resetConfirmMessage: string;
  noNumbersDrawn: string;
  lastDrawnNumber: string;
  previousDraw: string;
  noPreviousDraws: string;
  drawn: string;
  notDrawn: string;
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
    remaining: "Remaining",
    confirm: "Confirm",
    cancel: "Cancel",
    undoConfirmMessage: "Are you sure you want to undo the last drawn number?",
    resetConfirmMessage: "Are you sure you want to reset the game? All drawn numbers will be cleared.",
    noNumbersDrawn: "No numbers drawn yet",
    lastDrawnNumber: "Last drawn number",
    previousDraw: "Previous draw",
    noPreviousDraws: "No previous draws",
    drawn: "drawn",
    notDrawn: "not drawn",
  },
  it: {
    startGame: "Inizia Gioco",
    newGame: "Nuovo Gioco",
    language: "Lingua",
    english: "English",
    italian: "Italiano",
    draw: "Estrai",
    undo: "Annulla ultima estrazione",
    reset: "Azzera",
    lastDraws: "Ultime Estrazioni",
    last: "Ultimo",
    close: "Chiudi",
    remaining: "Rimanenti",
    confirm: "Conferma",
    cancel: "Annulla",
    undoConfirmMessage: "Sei sicuro di voler annullare l'ultimo numero estratto?",
    resetConfirmMessage: "Sei sicuro di voler azzerare il gioco? Tutti i numeri estratti saranno cancellati.",
    noNumbersDrawn: "Nessun numero estratto",
    lastDrawnNumber: "Ultimo numero estratto",
    previousDraw: "Estrazione precedente",
    noPreviousDraws: "Nessuna estrazione precedente",
    drawn: "estratto",
    notDrawn: "non estratto",
  },
};

export const useTranslations = (language: Language) => {
  return translations[language];
};

import { Language } from "../store/useLanguageStore";

type TranslationKeys = {
  // Core translations
  startGame: string;
  newGame: string;
  language: string;
  english: string;
  italian: string;
  draw: string;
  undoLastDraw: string;
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
  gameDescription: string;
  
  // Start Page
  startPage: string;
  selectMode: string;
  tabelloneMode: string;
  playerMode: string;
  tabelloneDescription: string;
  playerDescription: string;
  selectCartelle: string;
  howManyCartelle: string;
  cartelle: string;
  switchToEnglish: string;
  switchToItalian: string;
  settings: string;
  back: string;
  returnToStartPage: string;
  confirmAction: string;
  returnConfirmation: string;
  unmarkConfirmation: (num: number) => string;
  progressLost: string;
  
  // Player Mode
  noCartelleFound: string;
  stopPlaying: string;
};

type Translations = {
  [key in Language]: TranslationKeys;
};

export const translations: Translations = {
  en: {
    // Core translations
    startGame: "Start Game",
    newGame: "New Game",
    language: "Language",
    english: "English",
    italian: "Italian",
    draw: "Draw",
    undoLastDraw: "Undo last draw",
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
    
    // Start Page
    startPage: "Welcome to Paniere",
    selectMode: "Select Game Mode",
    tabelloneMode: "Game Master Mode",
    playerMode: "Player Mode",
    tabelloneDescription: "Draw numbers and manage the game",
    playerDescription: "Play with your own Cartelle",
    gameDescription: "A digital version of the traditional Neapolitan Tombola game. Draw numbers, mark your cartelle, and win prizes from ambo to tombola!",
    selectCartelle: "Select Cartelle",
    howManyCartelle: "How many Cartelle would you like?",
    cartelle: "Cartelle",
    switchToEnglish: "Switch to English",
    switchToItalian: "Switch to Italian",
    settings: "Settings",
    back: "Back",
    returnToStartPage: "Return to Start Page",
    confirmAction: "Confirm Action",
    returnConfirmation: "Are you sure you want to end your current game?",
    unmarkConfirmation: (num: number) => `Are you sure you want to unmark number ${num}?`,
    progressLost: "All progress will be lost.",
    
    // Player Mode
    noCartelleFound: "No cartelle found. Please return to the Start Page and select some cartelle.",
    stopPlaying: "Stop playing",
  },
  it: {
    // Core translations
    startGame: "Inizia Gioco",
    newGame: "Nuovo Gioco",
    language: "Lingua",
    english: "English",
    italian: "Italiano",
    draw: "Estrai",
    undoLastDraw: "Annulla ultimo estratto",
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
    
    // Start Page
    startPage: "Benvenuto a Paniere",
    selectMode: "Seleziona Modalità di Gioco",
    tabelloneMode: "Modalità Tabellone",
    playerMode: "Modalità Giocatore",
    tabelloneDescription: "Estrai numeri e gestisci il gioco",
    playerDescription: "Gioca con le tue Cartelle",
    gameDescription: "Una versione digitale del tradizionale gioco della Tombola Napoletana. Estrai numeri, segna le tue cartelle e vinci premi dall'ambo alla tombola!",
    selectCartelle: "Seleziona Cartelle",
    howManyCartelle: "Quante Cartelle vorresti?",
    cartelle: "Cartelle",
    switchToEnglish: "Passa all'inglese",
    switchToItalian: "Passa all'italiano",
    settings: "Impostazioni",
    back: "Indietro",
    returnToStartPage: "Torna alla pagina iniziale",
    confirmAction: "Conferma Azione",
    returnConfirmation: "Sei sicuro di voler terminare la partita corrente?",
    unmarkConfirmation: (num: number) => `Sei sicuro di voler deselezionare il numero ${num}?`,
    progressLost: "Tutti i progressi andranno persi.",
    
    // Player Mode
    noCartelleFound: "Nessuna cartella trovata. Torna alla pagina iniziale e seleziona alcune cartelle.",
    stopPlaying: "Smetti di giocare",
  },
};

export const useTranslations = (language: Language) => {
  return translations[language];
};

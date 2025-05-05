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
  learnToPlay: string;
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
  scrollToNumber: string;
  historyLast3: string;
  goToCard: string;
};

type Translations = {
  readonly [key in Language]: TranslationKeys;
};

const translations: Translations = {
  en: {
    // Core translations
    cancel: "Cancel",
    close: "Close",
    confirm: "Confirm",
    draw: "Draw",
    drawn: "drawn",
    english: "English",
    italian: "Italian",
    language: "Language",
    last: "Last",
    lastDrawnNumber: "Last drawn number",
    lastDraws: "Last Draws",
    newGame: "New Game",
    noNumbersDrawn: "No numbers drawn yet",
    noPreviousDraws: "No previous draws",
    notDrawn: "not drawn",
    previousDraw: "Previous draw",
    remaining: "Remaining",
    reset: "Reset",
    resetConfirmMessage:
      "Are you sure you want to reset the game? All drawn numbers will be cleared.",
    startGame: "Start Game",
    undoConfirmMessage: "Are you sure you want to undo the last drawn number?",
    undoLastDraw: "Undo last draw",

    // Start Page
    back: "Back",
    cartelle: "Cartelle",
    confirmAction: "Confirm Action",
    gameDescription:
      "A digital version of the traditional Neapolitan Tombola game. Draw numbers, mark your cartelle, and win prizes from ambo to tombola!",
    howManyCartelle: "How many Cartelle would you like?",
    learnToPlay: "Learn How to Play",
    playerDescription: "Select and play with your own Cartelle",
    playerMode: "Play as Player",
    progressLost: "All progress will be lost.",
    returnConfirmation: "Are you sure you want to end your current game?",
    returnToStartPage: "Return to Start Page",
    selectCartelle: "Select Cartelle",
    selectMode: "Select Game Mode",
    settings: "Settings",
    startPage: "Welcome to Paniere",
    switchToEnglish: "Switch to English",
    switchToItalian: "Switch to Italian",
    tabelloneDescription: "Draw numbers and manage the game",
    tabelloneMode: "Play as Game Master",
    unmarkConfirmation: (num: number) =>
      `Are you sure you want to unmark number ${num}?`,

    // Player Mode
    noCartelleFound:
      "No cartelle found. Please return to the Start Page and select some cartelle.",
    stopPlaying: "Stop playing",
    scrollToNumber: "Scroll to number",
    historyLast3: "Last 3",
    goToCard: "Go to card",
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
    undoConfirmMessage:
      "Sei sicuro di voler annullare l'ultimo numero estratto?",
    resetConfirmMessage:
      "Sei sicuro di voler azzerare il gioco? Tutti i numeri estratti saranno cancellati.",
    noNumbersDrawn: "Nessun numero estratto",
    lastDrawnNumber: "Ultimo numero estratto",
    previousDraw: "Estrazione precedente",
    noPreviousDraws: "Nessuna estrazione precedente",
    drawn: "estratto",
    notDrawn: "non estratto",

    // Start Page
    startPage: "Benvenuto a Paniere",
    selectMode: "Seleziona Modalità di Gioco",
    tabelloneMode: "Gioca come Tabellone",
    playerMode: "Gioca come Giocatore",
    tabelloneDescription: "Estrai numeri e gestisci il gioco",
    playerDescription: "Seleziona e gioca con le tue Cartelle",
    gameDescription:
      "Una versione digitale del tradizionale gioco della Tombola Napoletana. Estrai numeri, segna le tue cartelle e vinci premi dall'ambo alla tombola!",
    selectCartelle: "Seleziona Cartelle",
    howManyCartelle: "Quante Cartelle vorresti?",
    cartelle: "Cartelle",
    learnToPlay: "Impara a Giocare",
    switchToEnglish: "Passa all'inglese",
    switchToItalian: "Passa all'italiano",
    settings: "Impostazioni",
    back: "Indietro",
    returnToStartPage: "Torna alla pagina iniziale",
    confirmAction: "Conferma Azione",
    returnConfirmation: "Sei sicuro di voler terminare la partita corrente?",
    unmarkConfirmation: (num: number) =>
      `Sei sicuro di voler deselezionare il numero ${num}?`,
    progressLost: "Tutti i progressi andranno persi.",

    // Player Mode
    noCartelleFound:
      "Nessuna cartella trovata. Torna alla pagina iniziale e seleziona alcune cartelle.",
    stopPlaying: "Smetti di giocare",
    scrollToNumber: "Vai al numero",
    historyLast3: "Ultime 3",
    goToCard: "Vai alla cartella",
  },
};

export const useTranslations = (language: Language) => {
  return translations[language];
};

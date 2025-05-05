import { useState } from "react";
import { GameMode, useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { trackStartGame } from "../../utils/analytics";
import LanguageSelector from "../../components/LanguageSelector";
import RulesModal from "../RulesModal/RulesModal";
import { TabelloneIcon, CartellaIcon } from "../icons/TombolaIcons";

/**
 * Props for the StartPage component
 */
interface StartPageProps {
  onStart: () => void;
}

/**
 * Start Page component that allows selecting game mode and language
 */
const StartPage = ({ onStart }: StartPageProps) => {
  const setGameMode = useGameStore((state) => state.setGameMode);
  const generateCartelle = useGameStore((state) => state.generateCartelle);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useTranslations(language);

  // Local state for the start page
  const [selectedMode, setSelectedMode] = useState<
    "tabellone" | "player" | null
  >(null);
  const [cartelleCount, setCartelleCount] = useState(1);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Handlers for the rules modal
  const handleOpenRulesModal = () => setIsRulesModalOpen(true);
  const handleCloseRulesModal = () => setIsRulesModalOpen(false);

  /**
   * Handle starting the game with the selected mode
   */
  const handleStartGame = () => {
    if (!selectedMode) return;

    const analyticsMode: GameMode =
      selectedMode === "tabellone" ? "tabellone" : "player";
    trackStartGame(analyticsMode); // Track the event

    // Set game mode in the store
    setGameMode(selectedMode);

    // Generate cartelle based on the mode
    if (selectedMode === "tabellone") {
      generateCartelle(6); // Standard 6 cartelle for tabellone
    } else if (selectedMode === "player") {
      generateCartelle(cartelleCount);
    }

    // Notify parent to proceed
    onStart();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950 text-gray-900 dark:text-gray-100">
      {/* Language selector - placed first for better focus hierarchy */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector currentLanguage={language} onChange={setLanguage} />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-amber-200 opacity-20 dark:bg-amber-700 dark:opacity-10"></div>
        <div className="absolute top-1/4 -left-12 w-24 h-24 rounded-full bg-amber-300 opacity-10 dark:bg-amber-600 dark:opacity-5"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-amber-100 opacity-30 dark:bg-amber-800 dark:opacity-10"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTIgMmg1NnY1NkgyVjJ6IiBmaWxsLW9wYWNpdHk9Ii4xIiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==')] opacity-5 dark:opacity-[0.03]"></div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center gap-8">
        {/* Header with logo */}
        <header className="w-full flex flex-col items-center justify-center mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/images/paniere.png"
              alt={t.startPage}
              className="w-32 h-32 object-contain"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent font-display italic">
            Paniere
          </h1>
          <p className="text-md md:text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
            {t.gameDescription}
          </p>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleOpenRulesModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-800/30 dark:hover:bg-amber-800/40 dark:text-amber-300 rounded-lg transition-colors text-sm font-medium"
              aria-label={t.learnToPlay}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenRulesModal()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {t.learnToPlay}
            </button>
          </div>
        </header>

        {/* Game mode selection */}
        <section className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <h2 className="col-span-full text-2xl font-bold mb-6 text-center bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-500 dark:to-amber-700 bg-clip-text text-transparent font-display">
            {t.selectMode}
          </h2>

          {/* Tabellone mode */}
          <button
            onClick={() => setSelectedMode("tabellone")}
            className={`
              flex flex-col items-center p-6 rounded-xl shadow-md transition-all duration-300
              ${
                selectedMode === "tabellone"
                  ? "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/20 border-2 border-amber-400 dark:border-amber-700 transform scale-[1.02]"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-700/80"
              }
            `}
            aria-pressed={selectedMode === "tabellone"}
            aria-label={t.tabelloneMode}
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              setSelectedMode("tabellone")
            }
          >
            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-700/20">
              <TabelloneIcon
                className="text-amber-600 dark:text-amber-500 transform scale-125"
                aria-hidden="true"
                width="64"
                height="64"
              />
            </div>
            <h3
              className="text-xl font-bold mb-2 text-amber-700 dark:text-amber-500 font-display"
              id="tabellone-mode-label"
            >
              {t.tabelloneMode}
            </h3>
            <p
              className="text-sm text-gray-600 dark:text-gray-300 text-center"
              aria-labelledby="tabellone-mode-label"
            >
              {t.tabelloneDescription}
            </p>
          </button>

          {/* Player mode */}
          <button
            onClick={() => setSelectedMode("player")}
            className={`
              flex flex-col items-center p-6 rounded-xl shadow-md transition-all duration-300
              ${
                selectedMode === "player"
                  ? "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/20 border-2 border-amber-400 dark:border-amber-700 transform scale-[1.02]"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-700/80"
              }
            `}
            aria-pressed={selectedMode === "player"}
            aria-label={t.playerMode}
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && setSelectedMode("player")
            }
          >
            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-700/20">
              <CartellaIcon
                className="text-amber-600 dark:text-amber-500 transform scale-125"
                aria-hidden="true"
                width="64"
                height="38"
              />
            </div>
            <h3
              className="text-xl font-bold mb-2 text-amber-700 dark:text-amber-500 font-display"
              id="player-mode-label"
            >
              {t.playerMode}
            </h3>
            <p
              className="text-sm text-gray-600 dark:text-gray-300 text-center"
              aria-labelledby="player-mode-label"
            >
              {t.playerDescription}
            </p>
          </button>
        </section>

        {/* Cartelle count selection (only for Player mode) */}
        {selectedMode === "player" && (
          <section className="w-full bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-800/10 rounded-xl shadow-md p-6 border border-amber-200/70 dark:border-amber-800/30">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-amber-900 dark:from-amber-500 dark:to-amber-600 bg-clip-text text-transparent font-display">
              {t.selectCartelle}
            </h2>

            <div className="flex flex-col items-center">
              <p className="text-gray-700 dark:text-gray-300 mb-5 font-medium text-center">
                {t.howManyCartelle}
              </p>

              <div className="flex gap-3 flex-wrap justify-center">
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map(
                  (count) => (
                    <button
                      key={`cartelle-count-${count}`}
                      className={`
                      w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg
                      transition-all duration-300 shadow-sm
                      ${
                        cartelleCount === count
                          ? "bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white transform scale-110 shadow-md ring-2 ring-amber-300 dark:ring-amber-700/50"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:scale-105"
                      }
                    `}
                      onClick={() => setCartelleCount(count)}
                      aria-label={`${count} ${t.cartelle}`}
                      aria-pressed={cartelleCount === count}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        setCartelleCount(count)
                      }
                    >
                      {count}
                    </button>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* Start game button */}
        <div className="w-full flex flex-col items-center mt-6">
          <button
            className={`
              group relative flex w-full max-w-xs items-center justify-center overflow-hidden rounded-xl
              py-5 text-xl font-bold text-white shadow-lg transition-all duration-300 
              hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
              ${
                selectedMode
                  ? "bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-800 transform hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }
            `}
            onClick={handleStartGame}
            disabled={!selectedMode}
            aria-label={t.startGame}
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              selectedMode &&
              handleStartGame()
            }
          >
            {selectedMode && (
              <>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/20 to-transparent opacity-50" />
                <span className="absolute inset-0 h-full w-full bg-white/10 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </>
            )}
            <span className="relative flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              {t.startGame}
            </span>
          </button>
        </div>
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesModalOpen} onClose={handleCloseRulesModal} />
    </div>
  );
};

export default StartPage;

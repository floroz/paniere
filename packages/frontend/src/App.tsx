import { useState, useEffect, useRef, useCallback } from "react";
import Tabellone from "./components/Tabellone";
import PlayerMode from "./components/PlayerMode/PlayerMode";
import LastDrawsModal from "./components/LastDrawsModal/LastDrawsModal";
import {
  trackPageView,
  trackModeTimeSpent,
  trackResetGame,
  type AnalyticsGameMode,
} from "./utils/analytics";
import MobileFooter from "./components/MobileFooter/MobileFooter"; // Footer for Tabellone mode
import MobilePlayerFooter from "./components/MobilePlayerFooter/MobilePlayerFooter"; // Footer for Player mode
import TabelloneFooter from "./components/TabelloneFooter/TabelloneFooter";
import PlayerFooter from "./components/PlayerFooter/PlayerFooter";
import StartPage from "./components/StartPage/StartPage";
import Toast from "./components/Toast/Toast";
import Confetti from "./components/Confetti/Confetti";
import { GameMode, useGameStore } from "./store/useGameStore";
import { usePrizeStore } from "./store/usePrizeStore";
import type { TabelloneHandle } from "./components/Tabellone/Tabellone";

function App() {
  const [isLastDrawsModalOpen, setIsLastDrawsModalOpen] = useState(false);
  const tabelloneRef = useRef<TabelloneHandle>(null);
  const mobileFooterRef = useRef<HTMLDivElement>(null); // Ref for mobile footer (Tabellone)
  const mobilePlayerFooterRef = useRef<HTMLDivElement>(null); // Ref for mobile footer (Player)
  const desktopFooterRef = useRef<HTMLDivElement>(null); // Ref for desktop footer
  // Removed footerHeight state

  // Game state - core properties needed in this component
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const gameMode = useGameStore((state) => state.gameMode);
  const resetGame = useGameStore((state) => state.resetGame);
  const checkPrizes = useGameStore((state) => state.checkPrizes);
  const returnToStartPage = useGameStore((state) => state.returnToStartPage);

  // These actions are used by the StartPage component, not directly here
  // But we need them for the handleGameStart function
  const generateCartelle = useGameStore((state) => state.generateCartelle);

  // Prize celebration state
  const toastMessage = usePrizeStore((state) => state.toastMessage);
  const isToastVisible = usePrizeStore((state) => state.isToastVisible);
  const isConfettiActive = usePrizeStore((state) => state.isConfettiActive);
  const hideToast = usePrizeStore((state) => state.hideToast);

  // Refs for analytics timing
  const modeStartTimeRef = useRef<number | null>(null);
  const previousModeRef = useRef<typeof gameMode>(null);

  /**
   * Initialize app on first load if no game mode is set
   */
  useEffect(() => {
    // If no game mode is set, we're in the initial state
    // Don't automatically set a mode - let the user choose from the StartPage
  }, []);

  // Removed useEffect for footer height calculation

  /**
   * Check for prizes when drawn numbers change
   */
  useEffect(() => {
    if (drawnNumbers.length > 0) {
      checkPrizes(drawnNumbers);
    }
  }, [drawnNumbers, checkPrizes]);

  useTrackPageView({
    gameMode,
    modeStartTimeRef,
    previousModeRef,
  });

  /**
   * Handle starting a game from the Start Page
   */
  const handleGameStart = () => {
    // If we're in Tabellone mode, show the start game modal for language selection
    if (gameMode === "tabellone") {
      // Generate standard 6 cartelle if they don't exist yet
      if (!drawnNumbers.length) {
        generateCartelle(6);
      }
    } else if (gameMode === "player") {
      // Player mode is ready to go - cartelle should already be generated from StartPage
    }
  };

  /**
   * Handle returning to the start page
   */
  const handleReturnToStartPage = () => {
    returnToStartPage();
  };

  // Removed unused handleOpenLastDrawsModal

  /**
   * Handle closing the last draws modal
   */
  const handleCloseLastDrawsModal = () => setIsLastDrawsModalOpen(false);

  /**
   * Handle request to scroll Tabellone to a specific number (from MobileFooter)
   */
  const handleScrollRequest = useCallback((number: number) => {
    tabelloneRef.current?.scrollToNumber(number);
  }, []);

  /**
   * Handle resetting the game
   */
  const handleReset = () => {
    resetGame();
    trackResetGame(); // Track reset event
    // Don't show the start game modal anymore - just reset the game
  };

  /**
   * Render the appropriate content based on the game mode
   */
  const renderContent = () => {
    // If we have no game mode, show the start page
    if (gameMode === null) {
      return <StartPage onStart={handleGameStart} />;
    }

    // Otherwise render the appropriate game mode
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-orange-50 dark:bg-orange-950 text-gray-900 dark:text-gray-100">
        <div className="relative container max-w-6xl sm:p-4">
          {/* Apply fixed bottom padding using Tailwind class */}
          <div className="pb-24">
            {" "}
            {/* Added pb-24, removed inline style */}
            {/* Pass ref to Tabellone */}
            {gameMode === "tabellone" ? (
              <Tabellone ref={tabelloneRef} />
            ) : (
              <PlayerMode />
            )}
          </div>
        </div>

        {/* Render footers outside the main container div, conditionally, and add refs */}
        {gameMode === "tabellone" && (
          <>
            <div ref={desktopFooterRef}>
              {" "}
              {/* Ref wrapper for desktop footer */}
              <TabelloneFooter
                onReset={handleReset}
                onReturnToStartPage={handleReturnToStartPage}
              />
            </div>
            <div ref={mobileFooterRef}>
              {" "}
              {/* Ref wrapper for mobile footer */}
              <MobileFooter
                onReset={handleReset}
                onReturnToStartPage={handleReturnToStartPage}
                onScrollRequest={handleScrollRequest}
              />
            </div>
          </>
        )}
        {gameMode === "player" && (
          <>
            <div ref={desktopFooterRef}>
              {" "}
              {/* Ref wrapper for desktop footer */}
              <PlayerFooter onReturnToStartPage={handleReturnToStartPage} />
            </div>
            <div ref={mobilePlayerFooterRef}>
              {" "}
              {/* Ref wrapper for mobile footer */}
              <MobilePlayerFooter
                onReturnToStartPage={handleReturnToStartPage}
              />
            </div>
            {/* Removed duplicated block below */}
          </>
        )}
        {/* Removed duplicated gameMode === "player" block */}
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={hideToast}
        type="success"
        duration={4000}
      />

      <Confetti isActive={isConfettiActive} duration={5000} />

      <LastDrawsModal
        isOpen={isLastDrawsModalOpen}
        onClose={handleCloseLastDrawsModal}
      />
    </>
  );
}

export default App;

function useTrackPageView({
  gameMode,
  modeStartTimeRef,
  previousModeRef,
}: {
  gameMode: GameMode | null;
  modeStartTimeRef: React.RefObject<number | null>;
  previousModeRef: React.RefObject<GameMode | null>;
}) {
  // Effect for Analytics: Page Views and Time Tracking
  useEffect(() => {
    const currentMode = gameMode; // 'tabellone', 'player', or null
    const previousMode = previousModeRef.current;

    // === Handle Mode Exit ===
    // Check if we were previously in a trackable mode ('tabellone' or 'player')
    // and if the mode has changed OR we are exiting the app/component (though less likely here)
    if (
      (previousMode === "tabellone" || previousMode === "player") &&
      previousMode !== currentMode &&
      modeStartTimeRef.current
    ) {
      const durationMs = Date.now() - modeStartTimeRef.current;
      const durationSeconds = Math.round(durationMs / 1000);

      // Map the mode we are *exiting* to the analytics type ('master' or 'player')
      const exitedAnalyticsMode: AnalyticsGameMode = // Use aliased analytics type
        previousMode === "tabellone" ? "master" : "player";

      trackModeTimeSpent(exitedAnalyticsMode, durationSeconds);
      modeStartTimeRef.current = null; // Reset timer
    }

    // === Handle Mode Enter ===
    // Check if we are entering a trackable mode and it's different from the previous one
    if (
      (currentMode === "tabellone" || currentMode === "player") &&
      currentMode !== previousMode
    ) {
      let virtualPath: string;
      let pageTitle: string;
      // Removed unused analyticsMode variable

      if (currentMode === "tabellone") {
        virtualPath = "/game-master";
        pageTitle = "Game Master Mode";
        // Removed unused assignment: analyticsMode = "master";
      } else {
        // currentMode === 'player'
        virtualPath = "/player-mode";
        pageTitle = "Player Mode";
        // Removed unused assignment: analyticsMode = "player";
      }

      // Send simulated page view
      trackPageView(virtualPath, pageTitle);

      // Start timer for custom duration tracking
      modeStartTimeRef.current = Date.now();
    }

    // Update previous mode ref for the next render cycle
    previousModeRef.current = currentMode;
  }, [gameMode, modeStartTimeRef, previousModeRef]);
}

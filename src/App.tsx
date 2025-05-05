import { useState, useEffect, useRef, useCallback } from "react";
import Tabellone from "./components/Tabellone";
import PlayerMode from "./components/PlayerMode/PlayerMode";
import LastDrawsModal from "./components/LastDrawsModal/LastDrawsModal";
import {
  trackPageView,
  trackModeTimeSpent,
  trackResetGame,
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
  const [footerHeight, setFooterHeight] = useState(0); // State for dynamic padding

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

  // Effect to measure footer height for dynamic padding
  useEffect(() => {
    // Determine which footer is currently potentially visible
    const currentFooterRef =
      gameMode === "tabellone"
        ? window.innerWidth < 768 // md breakpoint
          ? mobileFooterRef.current
          : desktopFooterRef.current // Assuming TabelloneFooter uses this ref
        : gameMode === "player"
          ? window.innerWidth < 768
            ? mobilePlayerFooterRef.current
            : desktopFooterRef.current // Assuming PlayerFooter uses this ref
          : null;

    if (currentFooterRef) {
      // Use ResizeObserver for better accuracy if dimensions change
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Use const
          // Check if the target is an HTMLElement before accessing offsetHeight
          if (entry.target instanceof HTMLElement) {
            setFooterHeight(entry.target.offsetHeight);
          }
        }
      });
      resizeObserver.observe(currentFooterRef);
      // Initial measurement
      setFooterHeight(currentFooterRef.offsetHeight);
      // Cleanup observer on component unmount or ref change
      return () => resizeObserver.disconnect();
    } else {
      // Reset height if no footer is visible (e.g., on StartPage)
      setFooterHeight(0);
    }
    // Rerun when gameMode changes or potentially on resize (handled by ResizeObserver)
  }, [gameMode]);

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
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950 text-gray-900 dark:text-gray-100">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-amber-200 opacity-20 dark:bg-amber-700 dark:opacity-10"></div>
          <div className="absolute top-1/4 -left-12 w-24 h-24 rounded-full bg-amber-300 opacity-10 dark:bg-amber-600 dark:opacity-5"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-amber-100 opacity-30 dark:bg-amber-800 dark:opacity-10"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTIgMmg1NnY1NkgyVjJ6IiBmaWxsLW9wYWNpdHk9Ii4xIiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==')] opacity-5 dark:opacity-[0.03]"></div>
        </div>

        {/* Removed grid layout */}
        <div className="relative container max-w-6xl sm:p-4">
          {/* Apply dynamic padding using inline style, remove Tailwind class */}
          <div style={{ paddingBottom: `${footerHeight}px` }}>
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
  gameMode: string | null;
  modeStartTimeRef: React.RefObject<number | null>;
  previousModeRef: React.RefObject<typeof gameMode>;
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

      // Map the mode we are *exiting* to the analytics type
      const exitedAnalyticsMode: GameMode =
        previousMode === "tabellone" ? "tabellone" : "player";

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

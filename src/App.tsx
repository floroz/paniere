import { useState, useEffect } from "react";
import Tabellone from "./components/Tabellone";
import PlayerMode from "./components/PlayerMode/PlayerMode";
import LastDrawsModal from "./components/LastDrawsModal/LastDrawsModal";
import MobileFooter from "./components/MobileFooter/MobileFooter";
import TabelloneFooter from "./components/TabelloneFooter/TabelloneFooter";
import PlayerFooter from "./components/PlayerFooter/PlayerFooter";
import StartGameModal from "./components/StartGameModal";
import StartPage from "./components/StartPage/StartPage";
import Toast from "./components/Toast/Toast";
import Confetti from "./components/Confetti/Confetti";
import { useGameStore } from "./store/useGameStore";
import { usePrizeStore } from "./store/usePrizeStore";

function App() {
  const [isLastDrawsModalOpen, setIsLastDrawsModalOpen] = useState(false);
  const [isStartGameModalOpen, setIsStartGameModalOpen] = useState(false);

  // Game state - core properties needed in this component
  const drawnNumbers = useGameStore(state => state.drawnNumbers);
  const gameMode = useGameStore(state => state.gameMode);
  const resetGame = useGameStore(state => state.resetGame);
  const checkPrizes = useGameStore(state => state.checkPrizes);
  const returnToStartPage = useGameStore(state => state.returnToStartPage);
  
  // These actions are used by the StartPage component, not directly here
  // But we need them for the handleGameStart function
  const generateCartelle = useGameStore(state => state.generateCartelle);
  
  // Prize celebration state
  const toastMessage = usePrizeStore(state => state.toastMessage);
  const isToastVisible = usePrizeStore(state => state.isToastVisible);
  const isConfettiActive = usePrizeStore(state => state.isConfettiActive);
  const hideToast = usePrizeStore(state => state.hideToast);

  /**
   * Initialize app on first load if no game mode is set
   */
  useEffect(() => {
    // If no game mode is set, we're in the initial state
    // Don't automatically set a mode - let the user choose from the StartPage
  }, []);

  /**
   * Check for prizes when drawn numbers change
   */
  useEffect(() => {
    if (drawnNumbers.length > 0) {
      checkPrizes(drawnNumbers);
    }
  }, [drawnNumbers, checkPrizes]);
  
  /**
   * Handle starting a game from the Start Page
   */
  const handleGameStart = () => {
    // If we're in Tabellone mode, show the start game modal for language selection
    if (gameMode === 'tabellone') {
      // Generate standard 6 cartelle if they don't exist yet
      if (!drawnNumbers.length) {
        generateCartelle(6);
      }
      setIsStartGameModalOpen(true);
    } else if (gameMode === 'player') {
      // Player mode is ready to go - cartelle should already be generated from StartPage
      setIsStartGameModalOpen(false);
    }
  };
  
  /**
   * Handle returning to the start page
   */
  const handleReturnToStartPage = () => {
    returnToStartPage();
  };

  /**
   * Handle opening the last draws modal
   */
  const handleOpenLastDrawsModal = () => setIsLastDrawsModalOpen(true);

  /**
   * Handle closing the last draws modal
   */
  const handleCloseLastDrawsModal = () => setIsLastDrawsModalOpen(false);

  /**
   * Handle closing the start game modal
   */
  const handleCloseStartGameModal = () => setIsStartGameModalOpen(false);

  /**
   * Handle resetting the game
   */
  const handleReset = () => {
    resetGame();
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
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-amber-200 opacity-20 dark:bg-amber-700 dark:opacity-10"></div>
          <div className="absolute top-1/4 -left-12 w-24 h-24 rounded-full bg-amber-300 opacity-10 dark:bg-amber-600 dark:opacity-5"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-amber-100 opacity-30 dark:bg-amber-800 dark:opacity-10"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTIgMmg1NnY1NkgyVjJ6IiBmaWxsLW9wYWNpdHk9Ii4xIiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==')] opacity-5 dark:opacity-[0.03]"></div>
        </div>

        <div className="relative container max-w-6xl h-screen grid grid-cols-1 grid-rows-[1fr_min-content] overflow-hidden p-4">
          <div className="row-start-1 row-end-2 col-span-full overflow-auto">
            {gameMode === 'tabellone' ? <Tabellone /> : <PlayerMode />}
          </div>
          
          {gameMode === 'tabellone' ? (
            <TabelloneFooter onReset={handleReset} onReturnToStartPage={handleReturnToStartPage} />
          ) : (
            <PlayerFooter onReturnToStartPage={handleReturnToStartPage} />
          )}
        </div>

        {gameMode === 'tabellone' && (
          <MobileFooter
            onOpenLastDraws={handleOpenLastDrawsModal}
            onReset={handleReset}
            onReturnToStartPage={handleReturnToStartPage}
          />
        )}
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
      
      <Confetti 
        isActive={isConfettiActive}
        duration={5000}
      />
      
      <LastDrawsModal
        isOpen={isLastDrawsModalOpen}
        onClose={handleCloseLastDrawsModal}
      />
      
      <StartGameModal
        isOpen={isStartGameModalOpen}
        onClose={handleCloseStartGameModal}
      />
    </>
  );
}

export default App;

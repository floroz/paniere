import { useState, useEffect } from "react";
import Tabellone from "./components/Tabellone";
import LastDrawsModal from "./components/LastDrawsModal";
import MobileFooter from "./components/MobileFooter";
import Footer from "./components/Footer";
import StartGameModal from "./components/StartGameModal";
import { useGameStore } from "./store/useGameStore";

function App() {
  const [isLastDrawsModalOpen, setIsLastDrawsModalOpen] = useState(false);
  const [isStartGameModalOpen, setIsStartGameModalOpen] = useState(false);

  const drawn = useGameStore((state) => state.drawn);
  const resetGame = useGameStore((state) => state.resetGame);
  const checkPrizes = useGameStore((state) => state.checkPrizes);

  /**
   * Check if we need to show the start game modal
   */
  useEffect(() => {
    // If there are no drawn numbers, show the start game modal
    if (drawn.length === 0) {
      setIsStartGameModalOpen(true);
    }
  }, [drawn.length]);
  
  /**
   * Check for prizes when drawn numbers change
   */
  useEffect(() => {
    if (drawn.length > 0) {
      checkPrizes(drawn);
    }
  }, [drawn, checkPrizes]);

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
   * Handle resetting the game and showing the start game modal
   */
  const handleReset = () => {
    resetGame();
    setIsStartGameModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="container max-w-6xl h-screen grid grid-cols-1 grid-rows-[1fr_min-content] overflow-hidden">
            <div className="row-start-1 row-end-2 col-span-full overflow-auto">
              <Tabellone />
            </div>
            <Footer onReset={handleReset} />
          </div>
        </div>
        <MobileFooter
          onOpenLastDraws={handleOpenLastDrawsModal}
          onReset={handleReset}
        />
      </div>
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

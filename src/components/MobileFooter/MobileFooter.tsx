import { useGameStore } from '../../store/useGameStore';

/**
 * Mobile footer component that displays game controls and last drawn number
 * Only visible on small screens (below sm breakpoint)
 */
type MobileFooterProps = {
  onOpenLastDraws: () => void;
};

export default function MobileFooter({ onOpenLastDraws }: MobileFooterProps) {
  const drawn = useGameStore((state) => state.drawn);
  const lastDrawn = drawn[drawn.length - 1];
  const drawNumber = useGameStore((state) => state.drawNumber);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);
  const resetGame = useGameStore((state) => state.resetGame);
  
  // Calculate remaining numbers
  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawn.includes(num)
  );
  
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-3 z-40">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Remaining: {remainingNumbers.length}</div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={drawNumber}
              disabled={remainingNumbers.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-base font-medium disabled:opacity-50 hover:bg-blue-600"
              aria-label="Estrai"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && remainingNumbers.length > 0 && drawNumber()}
            >
              Estrai
            </button>
            <div className="flex space-x-1">
              <button 
                onClick={undoLastDraw}
                className="px-2 py-1.5 bg-gray-500 text-white rounded-md text-xs"
                aria-label="Annulla"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && undoLastDraw()}
              >
                Annulla
              </button>
              <button 
                onClick={resetGame}
                className="px-2 py-1.5 bg-red-500 text-white rounded-md text-xs"
                aria-label="Reset"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && resetGame()}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {lastDrawn && (
            <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900 px-2 py-1 rounded-md">
              <span className="text-xs text-amber-700 dark:text-amber-300 mr-1">
                Last:
              </span>
              <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
                {lastDrawn}
              </span>
            </div>
          )}
          
          <button
            onClick={onOpenLastDraws}
            className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm"
            aria-label="View last 3 draws"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenLastDraws()}
          >
            Last 3
          </button>
        </div>
      </div>
    </div>
  );
}

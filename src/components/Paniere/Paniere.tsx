import { useGameStore } from '../../store/useGameStore';

/**
 * Main game control panel that provides buttons to draw numbers,
 * undo last draw, and reset the game
 */
export default function Paniere() {
  const drawNumber = useGameStore((state) => state.drawNumber);
  const drawn = useGameStore((state) => state.drawn);
  const resetGame = useGameStore((state) => state.resetGame);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawn.includes(num)
  );
  
  return (
    <div className="p-3 border rounded-md bg-white dark:bg-gray-800 shadow-md">
      <p className="mb-3">Remaining: {remainingNumbers.length}</p>
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={drawNumber}
          disabled={remainingNumbers.length === 0}
          className="col-span-2 px-4 py-3 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 text-lg font-medium"
          aria-label="Estrai"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && drawNumber()}
        >
          Estrai
        </button>
        
        <div className="col-span-1 flex flex-col space-y-2">
          <button 
            onClick={undoLastDraw}
            className="px-2 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            aria-label="Annulla"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && undoLastDraw()}
          >
            Annulla
          </button>
          <button 
            onClick={resetGame}
            className="px-2 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            aria-label="Reset"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && resetGame()}
          >
            Reset
          </button>
        </div>
      </div>  
    </div>
  );
}

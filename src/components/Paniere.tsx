import { useGameStore } from '../store/useGameStore';

export default function Paniere() {
  const drawNumber = useGameStore((state) => state.drawNumber);
  const drawn = useGameStore((state) => state.drawn);
  const resetGame = useGameStore((state) => state.resetGame);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawn.includes(num)
  );
  
  return (
    <div className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-md">
      <h2 className="text-lg font-bold mb-2">Paniere</h2>
      <p className="mb-4">Remaining: {remainingNumbers.length}</p>
      <div className="flex space-x-2">
        <button 
          onClick={drawNumber}
          disabled={remainingNumbers.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600"
          aria-label="Estrai"
        >
          Estrai
        </button>
        <button 
          onClick={undoLastDraw}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          aria-label="Annulla"
        >
          Annulla
        </button>
        <button 
          onClick={resetGame}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          aria-label="Reset"
        >
          Reset
        </button>
      </div>  
    </div>
  );
}

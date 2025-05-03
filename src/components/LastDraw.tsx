import { useGameStore } from '../store/useGameStore';
import { neapolitanNames } from '../data/neapolitanNames';

export default function LastDraw() {
  const drawn = useGameStore((state) => state.drawn);
  const lastDrawn = drawn[drawn.length - 1];
  const previousDraws = drawn.slice(-3,-1).reverse();

  if (!lastDrawn) {
    return (
      <div className="p-3 border rounded-md bg-white dark:bg-gray-800 shadow-md text-center">
        <p className="text-gray-500 dark:text-gray-400">No numbers drawn yet</p>
      </div>
    );
  }
  
  return (
    <div className="p-3 border rounded-md bg-amber-50 dark:bg-amber-900 shadow-md">
      <div className="grid grid-cols-3 gap-2">
        {/* Last drawn number - takes up 2/3 of the space */}
        <div 
          key={`last-drawn-${lastDrawn}`} 
          className="col-span-2 flex flex-col items-center justify-center animate-fade-in border-r border-amber-200 dark:border-amber-700 pr-4"
        >
          <span 
            className="text-4xl font-bold text-amber-800 dark:text-amber-200"
            aria-label={`Last drawn number: ${lastDrawn}`}
          >
            {lastDrawn}
          </span>
          <span className="text-lg text-amber-700 dark:text-amber-300">
            {neapolitanNames[lastDrawn]}
          </span>
        </div>
        
        {/* Previous draws - takes up 1/3 of the space */}
        <div className="col-span-1 flex flex-col justify-center space-y-3">
          {previousDraws.length > 0 ? (
            previousDraws.map((num, index) => (
              <div 
                key={`prev-draw-${num}-${index}`} 
                className={`flex flex-col items-center ${index === 0 ? 'animate-fade-in' : 'animate-slide-down'}`}
                aria-label={`Previous draw: ${num}, ${neapolitanNames[num]}`}
              >
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {num}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {neapolitanNames[num]}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center italic">
              No previous draws
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

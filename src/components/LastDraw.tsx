import { useGameStore } from '../store/useGameStore';
import { neapolitanNames } from '../data/neapolitanNames';

export default function LastDraw() {
  const drawn = useGameStore((state) => state.drawn);
  const lastDrawn = drawn[0];
  const previousDraws = drawn.slice(1, 3);

  
  if (!lastDrawn) {
    return (
      <div className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-md text-center">
        <h2 className="text-lg font-bold mb-2">Last Draw</h2>
        <p className="text-gray-500 dark:text-gray-400">No numbers drawn yet</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-900 shadow-md text-center animate-fade-in">
      <h2 className="text-lg font-bold mb-2">Last Draw</h2>
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-center flex-1">
          <span className="text-4xl font-bold text-amber-800 dark:text-amber-200">
            {lastDrawn}
          </span>
          <span className="text-lg text-amber-700 dark:text-amber-300">
            {neapolitanNames[lastDrawn]}
          </span>
        </div>
        
        {/* Previous draws */}
        {previousDraws.length > 0 && (
          <div className="flex flex-col items-end space-y-2">
            {previousDraws.map((num, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {num}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {neapolitanNames[num]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add the animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
`;
document.head.appendChild(style);

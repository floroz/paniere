import { neapolitanNames } from "../data/neapolitanNames";
import { useGameStore } from "../store/useGameStore";

type CasellaProps = {
  number: number;
  name: string;
  isDrawn: boolean;
};

/**
 * Renders a single cell in the tabellone
 */
function Casella({ number, name, isDrawn }: CasellaProps) {
  return (
    <div 
      key={number}
      className={`
        p-1 border rounded-md flex flex-col items-center justify-center
        ${isDrawn ? 'bg-amber-100 dark:bg-amber-900' : 'bg-white dark:bg-gray-800'}
      `}
      aria-label={`${number}, ${name}, ${isDrawn ? 'drawn' : 'not drawn'}`}
    >
      <span className={`text-base font-bold ${isDrawn ? 'text-amber-800 dark:text-amber-200' : ''}`}>
        {number}
      </span>
      <span className="text-xs text-center truncate w-full">
        {name}
      </span>
    </div>
  );
}


export default function Tabellone() {
  const drawnNumbers = useGameStore((state) => state.drawn);
  
  // Generate numbers 1-90
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
  
  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 lg:grid-cols-10 gap-1 auto-rows-fr">
        {numbers.map((number) => {
          const isDrawn = drawnNumbers.includes(number);
          return (
            <Casella 
              key={number}
              number={number}
              name={neapolitanNames[number]}
              isDrawn={isDrawn}
            />
          );
        })}
      </div>
    </div>
  );
}

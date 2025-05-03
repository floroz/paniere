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
        p-2 border rounded-md flex flex-col items-center justify-center
        ${isDrawn ? 'bg-amber-100 dark:bg-amber-900' : 'bg-white dark:bg-gray-800'}
      `}
    >
      <span className={`text-lg font-bold ${isDrawn ? 'text-amber-800 dark:text-amber-200' : ''}`}>
        {number}
      </span>
      <span className="text-xs text-center">
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
    <div className="w-full">
      <div className="grid grid-cols-5 md:grid-cols-9 lg:grid-cols-10 gap-2">
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

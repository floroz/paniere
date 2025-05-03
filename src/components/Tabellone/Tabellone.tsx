import { neapolitanNames } from "../../data/neapolitanNames";
import { useGameStore } from "../../store/useGameStore";

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
        sm:w-auto w-10
        border rounded-md flex flex-col items-center justify-center aspect-square
        ${isDrawn ? 'bg-amber-100 dark:bg-amber-900' : 'bg-white dark:bg-gray-800'}
      `}
      aria-label={`${number}, ${name}, ${isDrawn ? 'drawn' : 'not drawn'}`}
    >
      <span className={`text-base font-bold ${isDrawn ? 'text-amber-800 dark:text-amber-200' : ''}`}>
        {number}
      </span>
      <span className="sm:block  hidden text-xs text-center break-words">
        {name}
      </span>
    </div>
  );
}

/**
 * Grid display of all 90 numbers in the game following the traditional Tombola layout
 * 9 rows x 10 columns = 90 numbers
 */
export default function Tabellone() {
  const drawnNumbers = useGameStore((state) => state.drawn);
  
  // Create a 9x10 grid (9 rows, 10 columns) for traditional Tombola layout
  // Each row has numbers 1-10, 11-20, 21-30, etc.
  const rows = Array.from({ length: 9 }, (_, rowIndex) => {
    return Array.from({ length: 10 }, (_, colIndex) => {
      return rowIndex * 10 + colIndex + 1;
    });
  });
  
  return (
    <div className="max-h-full w-full h-auto">
      <div className="grid grid-rows-[9] grid-cols-[10] gap-0.5">
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-10 gap-0.5">
            {row.map((number) => {
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
        ))}
      </div>
    </div>
  );
}

import { neapolitanNames } from "../data/neapolitanNames";

interface TabelloneProps {
  drawnNumbers?: number[];
}

export default function Tabellone({ drawnNumbers = [] }: TabelloneProps) {
  // Generate numbers 1-90
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Tabellone</h2>
      <div className="grid grid-cols-5 md:grid-cols-9 lg:grid-cols-10 gap-2">
        {numbers.map((number) => {
          const isDrawn = drawnNumbers.includes(number);
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
                {neapolitanNames[number]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

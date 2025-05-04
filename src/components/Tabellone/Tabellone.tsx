import { neapolitanNames } from "../../data/neapolitanNames";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { createCartelle } from "../../utils/cartelleUtils";

type CasellaProps = {
  number: number;
  name: string;
  isDrawn: boolean;
};

/**
 * Renders a single cell in the tabellone
 */
function Casella({ number, name, isDrawn }: CasellaProps) {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);
  return (
    <div 
      className={`
        sm:w-20 w-12 aspect-square 
        border rounded-md flex flex-col items-center justify-center
        ${isDrawn ? 'bg-amber-100 dark:bg-amber-900' : 'bg-white dark:bg-gray-800'}
      `}
      aria-label={`${number}, ${name}, ${isDrawn ? t.drawn : t.notDrawn}`}
    >
      <span className={`text-base font-bold ${isDrawn ? 'text-amber-800 dark:text-amber-200' : ''}`}>
        {number}
      </span>
      <span className="sm:block hidden text-xs text-center max-w-full px-1">
        {name}
      </span>
    </div>
  );
}

/**
 * Grid display of all 90 numbers in the game following the traditional Tombola layout
 * with visual boundaries for Cartelle (3x5 grids)
 */
export default function Tabellone() {
  const drawnNumbers = useGameStore((state) => state.drawn);
  
  // We don't need to store the cartelle array since we're using helper functions
  // to determine cartella boundaries and IDs
  createCartelle(); // Call once to ensure the structure is initialized
  
  // Create a 9x10 grid for the traditional Tombola layout
  const grid = Array.from({ length: 9 }, (_, rowIndex) => {
    return Array.from({ length: 10 }, (_, colIndex) => {
      // Handle the special case for number 90
      if (rowIndex === 8 && colIndex === 9) return 90;
      return rowIndex * 10 + colIndex + 1;
    });
  });

  // Find which cartella a cell belongs to
  const getCartellaId = (rowIndex: number, colIndex: number): number => {
    const cartellaRow = Math.floor(rowIndex / 3);
    const cartellaCol = Math.floor(colIndex / 5);
    return cartellaRow * 2 + cartellaCol + 1;
  };
  
  // Check if this cell is at a cartella boundary
  const isRightBoundary = (colIndex: number): boolean => {
    return (colIndex + 1) % 5 === 0 && colIndex !== 9;
  };
  
  const isBottomBoundary = (rowIndex: number): boolean => {
    return (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
  };
  
  // For mobile view, we'll render cartelle vertically instead of the full grid
  const renderMobileView = () => {
    // Get the cartelle data
    const cartelle = createCartelle();
    
    return (
      <div className="flex flex-col gap-y-0.5">
        {cartelle.map((cartella) => (
          <div key={`cartella-${cartella.id}`} className="flex flex-col gap-0.5 border-2 border-amber-500 p-1 rounded-md">
            {Array.from({ length: 3 }, (_, rowIdx) => {
              const actualRowIdx = cartella.startRow + rowIdx;
              return (
                <div key={`cartella-${cartella.id}-row-${rowIdx}`} className="flex flex-row gap-0.5">
                  {Array.from({ length: 5 }, (_, colIdx) => {
                    const actualColIdx = cartella.startCol + colIdx;
                    // Handle special case for number 90
                    let number;
                    if (actualRowIdx === 8 && actualColIdx === 9) {
                      number = 90;
                    } else {
                      number = actualRowIdx * 10 + actualColIdx + 1;
                    }
                    const isDrawn = drawnNumbers.includes(number);
                    
                    return (
                      <div key={number}>
                        <Casella 
                          number={number}
                          name={neapolitanNames[number]}
                          isDrawn={isDrawn}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  // For desktop view, we'll render the traditional 9×10 grid
  const renderDesktopView = () => {
    return (
      <div className="grid grid-flow-row auto-rows-auto gap-0.5 justify-center">
        {grid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-row gap-0.5">
            {row.map((number, colIndex) => {
              const isDrawn = drawnNumbers.includes(number);
              const cartellaId = getCartellaId(rowIndex, colIndex);
              
              // Add special classes for cells at cartella boundaries
              const rightBorder = isRightBoundary(colIndex) ? 'border-r-2 border-r-amber-500 pr-0.5' : '';
              const bottomBorder = isBottomBoundary(rowIndex) ? 'border-b-2 border-b-amber-500 pb-0.5' : '';
              
              return (
                <div 
                  key={number}
                  className={`${rightBorder} ${bottomBorder}`}
                  aria-label={`Cartella ${cartellaId}`}
                >
                  <Casella 
                    number={number}
                    name={neapolitanNames[number]}
                    isDrawn={isDrawn}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="max-h-full w-full h-auto overflow-auto">
      {/* Show mobile view on small screens, desktop view on larger screens */}
      <div className="sm:hidden">
        {renderMobileView()}
      </div>
      <div className="hidden sm:block">
        {renderDesktopView()}
      </div>
    </div>
  );
}

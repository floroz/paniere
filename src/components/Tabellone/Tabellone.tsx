import { neapolitanNames } from "../../data/neapolitanNames";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { createCartelle } from "../../utils/cartelleUtils";
import { useMemo } from "react";

type CasellaProps = {
  number: number;
  name: string;
  isDrawn: boolean;
  isLatestDrawn: boolean;
};

/**
 * Renders a single cell in the tabellone
 */
const Casella = ({ number, name, isDrawn, isLatestDrawn }: CasellaProps) => {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);
  
  return (
    <div 
      className={`
        relative w-14 sm:w-20 aspect-square 
        overflow-hidden group
        rounded-xl shadow-sm transition-all duration-300
        ${isDrawn 
          ? isLatestDrawn 
            ? 'bg-gradient-to-br from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800 ring-4 ring-amber-300 dark:ring-amber-600 ring-opacity-50 dark:ring-opacity-50 animate-pulse' 
            : 'bg-gradient-to-br from-amber-100 to-amber-300 dark:from-amber-700 dark:to-amber-900' 
          : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'}
        ${isDrawn ? 'scale-[0.97]' : 'hover:scale-[0.97]'}
        flex flex-col items-center justify-center
      `}
      aria-label={`${number}, ${name}, ${isDrawn ? t.drawn : t.notDrawn}`}
      tabIndex={0}
      role="gridcell"
    >
      {/* Border overlay */}
      <div className={`absolute inset-0 border border-gray-200 dark:border-gray-700 rounded-xl ${isDrawn ? 'opacity-0' : 'opacity-100'}`}></div>
      
      {/* Background overlay with animation */}
      {isDrawn && (
        <div className="absolute inset-0 bg-amber-50 dark:bg-amber-950 opacity-10"></div>
      )}
      
      {/* Small decorative square in corner */}
      <div className="absolute top-1 left-1 w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700 opacity-50"></div>
      
      {/* Number */}
      <span 
        className={`text-xl sm:text-2xl font-bold transition-colors duration-300
          ${isLatestDrawn 
            ? 'text-white dark:text-white' 
            : isDrawn 
              ? 'text-amber-800 dark:text-amber-200' 
              : 'text-gray-800 dark:text-gray-200'
          }
        `}
      >
        {number}
      </span>
      
      {/* Name */}
      <span 
        className={`
          text-2xs sm:text-xs text-center max-w-full px-1 truncate transition-colors duration-300
          ${isLatestDrawn 
            ? 'text-white dark:text-white' 
            : isDrawn 
              ? 'text-amber-700 dark:text-amber-300' 
              : 'text-gray-600 dark:text-gray-400'
          }
        `}
      >
        {name}
      </span>
      
      {/* Radial gradient overlay for hover effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 dark:from-white/0 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

/**
 * Grid display of all 90 numbers in the game following the traditional Tombola layout
 * with visual boundaries for Cartelle (3x5 grids)
 */
const Tabellone = () => {
  const drawnNumbers = useGameStore((state) => state.drawn);
  const lastDrawnNumber = drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null;
  
  // We don't need to store the cartelle array since we're using helper functions
  // to determine cartella boundaries and IDs
  createCartelle(); // Call once to ensure the structure is initialized
  
  // Create a 9x10 grid for the traditional Tombola layout with memoization
  const grid = useMemo(() => {
    return Array.from({ length: 9 }, (_, rowIndex) => {
      return Array.from({ length: 10 }, (_, colIndex) => {
        // Handle the special case for number 90
        if (rowIndex === 8 && colIndex === 9) return 90;
        return rowIndex * 10 + colIndex + 1;
      });
    });
  }, []);

  /**
   * Find which cartella a cell belongs to
   */
  const getCartellaId = (rowIndex: number, colIndex: number): number => {
    const cartellaRow = Math.floor(rowIndex / 3);
    const cartellaCol = Math.floor(colIndex / 5);
    return cartellaRow * 2 + cartellaCol + 1;
  };
  
  /**
   * Check if this cell is at a cartella boundary
   */
  const isRightBoundary = (colIndex: number): boolean => {
    return (colIndex + 1) % 5 === 0 && colIndex !== 9;
  };
  
  const isBottomBoundary = (rowIndex: number): boolean => {
    return (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
  };
  
  /**
   * For mobile view, we'll render cartelle vertically instead of the full grid
   */
  const renderMobileView = () => {
    // Get the cartelle data
    const cartelle = createCartelle();
    
    return (
      <div className="flex flex-col gap-2 px-2 py-1">
        {cartelle.map((cartella) => (
          <div 
            key={`cartella-${cartella.id}`} 
            className="flex flex-col gap-1 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-750 border border-amber-200 dark:border-amber-800 p-3 rounded-xl shadow-md"
          >
            <div className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-1 px-1">
              Cartella {cartella.id}
            </div>
            {Array.from({ length: 3 }, (_, rowIdx) => {
              const actualRowIdx = cartella.startRow + rowIdx;
              return (
                <div key={`cartella-${cartella.id}-row-${rowIdx}`} className="flex flex-row justify-center gap-1">
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
                    const isLatestDrawn = number === lastDrawnNumber;
                    
                    return (
                      <div key={number} className="transform transition-transform duration-300">
                        <Casella 
                          number={number}
                          name={neapolitanNames[number]}
                          isDrawn={isDrawn}
                          isLatestDrawn={isLatestDrawn}
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
  
  /**
   * For desktop view, we'll render the traditional 9×10 grid
   */
  const renderDesktopView = () => {
    return (
      <div className="grid grid-flow-row auto-rows-auto gap-1 justify-center">
        {grid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-row gap-1">
            {row.map((number, colIndex) => {
              const isDrawn = drawnNumbers.includes(number);
              const isLatestDrawn = number === lastDrawnNumber;
              const cartellaId = getCartellaId(rowIndex, colIndex);
              
              // Add special classes for cells at cartella boundaries
              const rightBorder = isRightBoundary(colIndex) ? 'border-r-2 border-r-amber-400 dark:border-r-amber-700 pr-1 mr-1' : '';
              const bottomBorder = isBottomBoundary(rowIndex) ? 'border-b-2 border-b-amber-400 dark:border-b-amber-700 pb-1 mb-1' : '';
              
              return (
                <div 
                  key={number}
                  className={`${rightBorder} ${bottomBorder} transition-transform duration-300`}
                  aria-label={`Cartella ${cartellaId}`}
                >
                  <Casella 
                    number={number}
                    name={neapolitanNames[number]}
                    isDrawn={isDrawn}
                    isLatestDrawn={isLatestDrawn}
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
    <div className="max-h-full w-full h-auto overflow-auto py-4">
      <div className="md:hidden">
        {renderMobileView()}
      </div>
      <div className="hidden md:block">
        {renderDesktopView()}
      </div>
    </div>
  );
};

export default Tabellone;

import { neapolitanNames } from "../../data/neapolitanNames";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { createCartelle } from "../../utils/cartelleUtils";
import { usePrizeStore } from "../../store/usePrizeStore";
import { useMemo, useRef, useImperativeHandle, forwardRef } from "react"; // Added refs and forwardRef

// Define the type for the exposed handle
export type TabelloneHandle = {
  scrollToNumber: (number: number) => void;
};

type CasellaProps = {
  number: number;
  name: string;
  isDrawn: boolean;
  isLatestDrawn: boolean;
  isWinningNumber: boolean;
};

/**
 * Renders a single cell in the tabellone
 */
const Casella = ({
  number,
  name,
  isDrawn,
  isLatestDrawn,
  isWinningNumber,
}: CasellaProps) => {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  const getBackgroundStyle = () => {
    if (isLatestDrawn) {
      return "bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 ring-4 ring-amber-400 dark:ring-amber-500 ring-opacity-50 dark:ring-opacity-50 animate-pulse";
    }

    if (isWinningNumber) {
      return "bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 ring-4 ring-green-400 dark:ring-green-600 ring-opacity-50 dark:ring-opacity-50 animate-pulseGreen";
    }

    if (isDrawn) {
      return "bg-gradient-to-br from-amber-100 to-amber-300 dark:from-amber-700 dark:to-amber-900";
    }
    return "bg-white hover:bg-amber-50 dark:bg-gray-800 dark:hover:bg-gray-700";
  };

  return (
    <div
      className={`
        relative w-14 sm:w-20 aspect-square 
        overflow-hidden group
        rounded-xl shadow-sm transition-all duration-300
        ${getBackgroundStyle()}
        ${isDrawn ? "scale-[0.97]" : "hover:scale-[0.97]"}
        flex flex-col items-center justify-center
      `}
      aria-label={`${number}, ${name}, ${isDrawn ? t.drawn : t.notDrawn}${isWinningNumber ? ", winning number" : ""}`}
      tabIndex={-1} /* Make cells not focusable in Tabellone mode */
      role="gridcell"
      aria-readonly="true"
    >
      {/* Border overlay */}
      <div
        className={`absolute inset-0 border border-gray-200 dark:border-gray-700 rounded-xl ${isDrawn ? "opacity-0" : "opacity-100"}`}
      ></div>

      {isDrawn && (
        <div className="absolute inset-0 bg-orange-50 dark:bg-orange-950 opacity-10"></div>
      )}

      <div className="absolute top-1 left-1 w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700 opacity-50"></div>

      {/* Number */}
      <span
        className={`text-xl sm:text-2xl font-bold transition-colors duration-300
          ${
            isLatestDrawn
              ? "text-white dark:text-white" // Keep white for latest drawn
              : isDrawn
                ? "text-amber-800 dark:text-amber-200" // Change drawn text to amber
                : "text-gray-800 dark:text-gray-200"
          }
        `}
      >
        {number}
      </span>

      {/* Name */}
      <span
        className={`
          text-2xs sm:text-xs text-center max-w-full px-1 truncate transition-colors duration-300
          ${
            // Updated text colors
            isLatestDrawn
              ? "text-white dark:text-white" // Keep white for latest drawn
              : isDrawn
                ? "text-amber-700 dark:text-amber-300" // Change drawn name text to amber
                : "text-gray-600 dark:text-gray-400"
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
 * Grid display of all 90 numbers. Exposes a method to scroll to a specific number on mobile.
 */
const Tabellone = forwardRef<TabelloneHandle>((_, ref) => {
  // Wrap in forwardRef
  // Use the unified data model
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const gameModeCartelle = useGameStore((state) => state.cartelle);
  const lastDrawnNumber =
    drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null;

  // Get winning sequences from the prize store for highlighting
  const winningSequences = usePrizeStore((state) => state.winningSequences);
  // Create a set of all numbers that are part of a winning sequence for efficient lookups
  const winningNumbers = useMemo(() => {
    const numbers = new Set<number>();
    winningSequences.forEach((sequence) => {
      sequence.numbers.forEach((number) => numbers.add(number));
    });
    return numbers;
  }, [winningSequences]);

  // Refs for mobile cartella divs
  const mobileCartellaRefs = useRef<Map<number, HTMLDivElement | null>>(
    new Map(),
  );

  // Create a 9x10 grid for the tabellone
  // This matches the traditional layout of 9 rows and 10 columns
  const grid = useMemo(() => {
    const result: number[][] = [];
    for (let row = 0; row < 9; row++) {
      const rowNumbers: number[] = [];
      for (let col = 0; col < 10; col++) {
        // The last cell of the 9th row is number 90
        if (row === 8 && col === 9) {
          rowNumbers.push(90);
        } else {
          rowNumbers.push(row * 10 + col + 1);
        }
      }
      result.push(rowNumbers);
    }
    return result;
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
    // Ensure refs map is cleared/updated if cartelle change (though unlikely in Tabellone mode)
    mobileCartellaRefs.current = new Map();
    // Use the cartelle from the game store
    const cartelle =
      gameModeCartelle.length > 0 ? gameModeCartelle : createCartelle();

    return (
      <div className="flex flex-col gap-2 px-2 py-1">
        {cartelle.map((cartella) => (
          <div
            key={`cartella-${cartella.id}`}
            ref={(el) => {
              mobileCartellaRefs.current.set(cartella.id, el);
            }}
            className="flex flex-col gap-1 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border border-orange-200 dark:border-orange-700 p-3 rounded-xl shadow-md scroll-mt-4"
          >
            <div className="text-xs font-medium text-red-800 dark:text-red-400 mb-1 px-1">
              Cartella {cartella.id}
            </div>
            {Array.from({ length: 3 }, (_, rowIdx) => {
              const actualRowIdx = cartella.startRow + rowIdx;
              return (
                <div
                  key={`cartella-${cartella.id}-row-${rowIdx}`}
                  className="flex flex-row justify-center gap-1"
                >
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
                    // Check if this number is part of a winning sequence
                    const isWinningNumber = winningNumbers.has(number);

                    return (
                      <div
                        key={number}
                        className="transform transition-transform duration-300"
                      >
                        <Casella
                          number={number}
                          name={neapolitanNames[number]}
                          isDrawn={isDrawn}
                          isLatestDrawn={isLatestDrawn}
                          isWinningNumber={isWinningNumber}
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
              // Check if this number is part of a winning sequence
              const isWinningNumber = winningNumbers.has(number);
              const cartellaId = getCartellaId(rowIndex, colIndex);

              const rightBorder = isRightBoundary(colIndex)
                ? "border-r-2 border-r-red-400 dark:border-r-red-700 pr-1 mr-1"
                : "";
              const bottomBorder = isBottomBoundary(rowIndex)
                ? "border-b-2 border-b-red-400 dark:border-b-red-700 pb-1 mb-1"
                : "";

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
                    isWinningNumber={isWinningNumber}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Function to scroll to a specific number on mobile
  const scrollToNumber = (number: number) => {
    if (!gameModeCartelle || gameModeCartelle.length === 0) return;

    // Find the cartella containing the number
    let targetCartellaId: number | null = null;
    for (const cartella of gameModeCartelle) {
      for (const row of cartella.numbers) {
        if (row.includes(number)) {
          targetCartellaId = cartella.id;
          break;
        }
      }
      if (targetCartellaId !== null) break;
    }

    // Scroll to the cartella div if found
    if (targetCartellaId !== null) {
      const cartellaRef = mobileCartellaRefs.current.get(targetCartellaId);
      cartellaRef?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Expose the scrollToNumber function via the ref
  useImperativeHandle(ref, () => ({
    scrollToNumber,
  }));

  return (
    // Removed max-h-full and overflow-auto to allow page scroll
    <div className="w-full h-auto py-4">
      <div className="md:hidden">{renderMobileView()}</div>
      <div className="hidden md:block">{renderDesktopView()}</div>
    </div>
  );
}); // Close forwardRef

export default Tabellone;

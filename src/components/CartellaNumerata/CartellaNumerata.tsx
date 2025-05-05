import { useState, useRef, KeyboardEvent, useCallback } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { CartellaData } from "../../utils/cartelleUtils";
import { neapolitanNames } from "../../data/neapolitanNames";
import ConfirmationDialog from "../ConfirmationDialog";

/**
 * Props for the CartellaNumerata component
 */
interface CartellaNumerataProps {
  cartella: CartellaData;
}

/**
 * Interactive cartella component for Player Mode
 * Allows players to mark numbers on their cartella
 */
const CartellaNumerata = ({ cartella }: CartellaNumerataProps) => {
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const markNumber = useGameStore((state) => state.markNumber);
  const unmarkNumber = useGameStore((state) => state.unmarkNumber);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  // State for confirmation dialog
  const [isUnmarkDialogOpen, setIsUnmarkDialogOpen] = useState(false);
  const [numberToUnmark, setNumberToUnmark] = useState<number | null>(null);

  /**
   * Handle clicking on a number in the cartella
   */
  const handleNumberClick = useCallback(
    (number: number) => {
      if (number === 0) return; // Skip empty cells

      // If number is already marked, show confirmation dialog
      if (drawnNumbers.includes(number)) {
        setNumberToUnmark(number);
        setIsUnmarkDialogOpen(true);
        return;
      }

      // Otherwise, mark the number
      markNumber(number);
    },
    [drawnNumbers, markNumber, setIsUnmarkDialogOpen, setNumberToUnmark],
  );

  /**
   * Handle confirming number unmarking
   */
  const handleUnmarkConfirm = () => {
    if (numberToUnmark) {
      // Use unmarkNumber to remove the number from drawn numbers
      unmarkNumber(numberToUnmark);
      setIsUnmarkDialogOpen(false);
      setNumberToUnmark(null);
    }
  };

  /**
   * Handle closing the unmark dialog
   */
  const handleCloseUnmarkDialog = () => {
    setIsUnmarkDialogOpen(false);
    setNumberToUnmark(null);
  };

  // State for active descendant pattern - track the currently active cell
  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Container ref for the grid
  const gridRef = useRef<HTMLDivElement>(null);

  /**
   * Handle keyboard navigation within the cartella using active descendant pattern
   */
  const handleGridKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // Skip if user is typing Ctrl, Alt, or meta key combos
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // If no cell is active yet, set the first valid cell as active
      if (!activeCell) {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 9; c++) {
            if (cartella.numbers[r][c] !== 0) {
              setActiveCell({ row: r, col: c });
              return;
            }
          }
        }
        return;
      }

      let { row: newRow, col: newCol } = activeCell;
      let handled = true;

      // Handle arrow key navigation
      switch (e.key) {
        case "ArrowUp":
          newRow = Math.max(0, newRow - 1);
          break;
        case "ArrowDown":
          newRow = Math.min(2, newRow + 1);
          break;
        case "ArrowLeft":
          newCol = Math.max(0, newCol - 1);
          break;
        case "ArrowRight":
          newCol = Math.min(8, newCol + 1);
          break;
        case "Home":
          newCol = 0;
          break;
        case "End":
          newCol = 8;
          break;
        case "Enter":
        case " ":
          // Activate the current cell
          if (cartella.numbers[activeCell.row][activeCell.col] > 0) {
            handleNumberClick(cartella.numbers[activeCell.row][activeCell.col]);
          }
          break;
        default:
          handled = false;
          return; // Return early for other keys
      }

      // If we handled the key, prevent default
      if (handled) {
        e.preventDefault();
      }

      // Find the next valid cell (skip empty cells)
      while (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 9) {
        if (cartella.numbers[newRow][newCol] !== 0) {
          setActiveCell({ row: newRow, col: newCol });
          return;
        }

        // If we didn't find a valid cell, try the next one in the same direction
        if (e.key === "ArrowUp") newRow--;
        else if (e.key === "ArrowDown") newRow++;
        else if (e.key === "ArrowLeft") newCol--;
        else if (e.key === "ArrowRight") newCol++;
        else break; // For home/end, don't loop
      }
    },
    [activeCell, cartella.numbers, handleNumberClick],
  );

  /**
   * Get the appropriate style for a cell based on its state
   */
  const getCellStyle = (number: number) => {
    if (number === 0) {
      return "bg-transparent";
    }

    if (drawnNumbers.includes(number)) {
      return "bg-gradient-to-br from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800 text-white dark:text-white scale-95 shadow-md";
    }

    return "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-95";
  };

  return (
    <>
      <div
        ref={gridRef}
        className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-750 border border-amber-200 dark:border-amber-800 p-3 rounded-xl shadow-md"
        role="grid"
        aria-label={`Cartella ${cartella.id}`}
        tabIndex={0} /* Make the grid container focusable */
        onKeyDown={handleGridKeyDown}
        aria-activedescendant={
          activeCell
            ? `cartella-${cartella.id}-cell-${activeCell.row}-${activeCell.col}`
            : undefined
        }
      >
        <div className="mb-2 px-1">
          <div className="text-xs font-medium text-amber-800 dark:text-amber-400">
            Cartella {cartella.id}
          </div>
        </div>

        <div className="grid grid-rows-3 gap-1 w-full">
          {Array.from({ length: 3 }, (_, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="grid grid-cols-9 gap-1"
              role="row"
            >
              {Array.from({ length: 9 }, (_, colIdx) => {
                // Each number is placed in its corresponding column based on its value
                // Column 0: numbers 1-9, Column 1: numbers 10-19, etc.
                const number = cartella.numbers[rowIdx][colIdx];
                const isActive =
                  activeCell?.row === rowIdx && activeCell?.col === colIdx;

                return (
                  <div
                    key={`cell-${rowIdx}-${colIdx}`}
                    id={`cartella-${cartella.id}-cell-${rowIdx}-${colIdx}`}
                    className={`
                      relative w-7 h-7 sm:w-9 sm:h-9 
                      overflow-hidden group
                      rounded-md ${number > 0 ? "shadow-sm" : ""} transition-all duration-300
                      ${getCellStyle(number)}
                      flex flex-col items-center justify-center
                      ${isActive && number > 0 ? "ring-2 ring-amber-500 ring-offset-1" : ""}
                    `}
                    onClick={() => number > 0 && handleNumberClick(number)}
                    aria-label={
                      number === 0
                        ? "Empty cell"
                        : `${number}, ${neapolitanNames[number]}, ${drawnNumbers.includes(number) ? t.drawn : t.notDrawn}`
                    }
                    role="gridcell"
                    aria-disabled={number === 0 ? "true" : "false"}
                    aria-selected={isActive ? "true" : "false"}
                  >
                    {number !== 0 && (
                      <>
                        {/* Number */}
                        <span className="text-sm sm:text-base font-bold transition-colors duration-300">
                          {number}
                        </span>

                        {/* Background overlay with animation */}
                        {drawnNumbers.includes(number) && (
                          <div className="absolute inset-0 bg-amber-50 dark:bg-amber-950 opacity-10"></div>
                        )}

                        {/* Radial gradient overlay for hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 dark:from-white/0 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isUnmarkDialogOpen}
        onClose={handleCloseUnmarkDialog}
        onConfirm={handleUnmarkConfirm}
        title={t.confirmAction}
        message={t.unmarkConfirmation(numberToUnmark ?? 0)}
        confirmText={t.confirm}
        cancelText={t.cancel}
      />
    </>
  );
};

export default CartellaNumerata;

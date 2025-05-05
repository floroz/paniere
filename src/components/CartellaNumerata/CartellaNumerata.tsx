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
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const currentActive = activeCell; // Use const as it's not reassigned

      // Initialize active cell if none exists
      if (!currentActive) {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 9; c++) {
            if (cartella.numbers[r][c] !== 0) {
              setActiveCell({ row: r, col: c });
              e.preventDefault(); // Prevent scroll if initializing
              return;
            }
          }
        }
        return; // No valid cells found
      }

      let { row: targetRow, col: targetCol } = currentActive;
      let direction: "up" | "down" | "left" | "right" | null = null;
      let actionHandled = true; // Assume we handle it unless default case

      switch (e.key) {
        case "ArrowUp":
          targetRow = Math.max(0, currentActive.row - 1);
          direction = "up";
          break;
        case "ArrowDown":
          targetRow = Math.min(2, currentActive.row + 1);
          direction = "down";
          break;
        case "ArrowLeft":
          targetCol = Math.max(0, currentActive.col - 1);
          direction = "left";
          break;
        case "ArrowRight":
          targetCol = Math.min(8, currentActive.col + 1);
          direction = "right";
          break;
        case "Home":
          targetCol = 0;
          direction = "right"; // Search right from home
          break;
        case "End":
          targetCol = 8;
          direction = "left"; // Search left from end
          break;
        case "Enter":
        case " ":
          if (cartella.numbers[currentActive.row][currentActive.col] > 0) {
            handleNumberClick(
              cartella.numbers[currentActive.row][currentActive.col],
            );
          }
          break; // Action handled, but no cell change
        default:
          actionHandled = false; // Key not handled by navigation/action
          return;
      }

      // If the key was handled (navigation or action), prevent default browser behavior (like scrolling)
      if (actionHandled) {
        e.preventDefault();
      }

      // If it was an action key (Enter/Space), we already handled it and don't need to move
      if (!direction) {
        return;
      }

      // Directly set the new active cell based on the calculated targetRow/targetCol
      // Boundary checks were already applied in the switch statement
      // This allows navigation *to* empty cells
      setActiveCell({ row: targetRow, col: targetCol });
    },
    // Dependency array for useCallback - added setActiveCell
    [activeCell, cartella.numbers, handleNumberClick, setActiveCell],
  );

  /**
   * Get the appropriate style for a cell based on its state
   */
  const getCellStyle = (number: number, isDrawn: boolean) => {
    // No special style needed for empty cells here anymore, handled below
    if (isDrawn) {
      return "bg-gradient-to-br from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800 text-white dark:text-white scale-95 shadow-md";
    }

    return "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-95";
  };

  return (
    <>
      <div
        ref={gridRef}
        className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-750 border border-amber-200 dark:border-amber-800 p-2 rounded-xl shadow-md" // Reduced padding slightly
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
                      relative w-8 h-8
                      overflow-hidden group
                      rounded-md shadow-sm transition-all duration-300
                      border border-black/10 dark:border-white/10
                      ${getCellStyle(number, drawnNumbers.includes(number))}
                      ${number === 0 ? "bg-gray-100/50 dark:bg-gray-800/30" : ""}
                      flex flex-col items-center justify-center
                      ${isActive ? "ring-2 ring-amber-500 ring-offset-1" : ""}
                    `}
                    // Allow click handling even on empty cells if needed in future, but action depends on number > 0
                    onClick={() => handleNumberClick(number)}
                    aria-label={
                      number === 0
                        ? "Empty cell" // Use placeholder text for now
                        : `${number}, ${neapolitanNames[number]}, ${drawnNumbers.includes(number) ? t.drawn : t.notDrawn}`
                    }
                    role="gridcell"
                    // Empty cells are part of the grid but cannot be interacted with in the same way
                    aria-disabled={number === 0 ? "true" : "false"}
                    aria-selected={isActive ? "true" : "false"}
                    tabIndex={-1} // Individual cells not focusable, grid container is
                  >
                    {/* Render number only if it's not 0 */}
                    {number !== 0 ? (
                      <>
                        {/* Number - Adjusted font size */}
                        <span className="text-base font-bold transition-colors duration-300">
                          {number}
                        </span>

                        {/* Background overlay with animation */}
                        {drawnNumbers.includes(number) && (
                          <div className="absolute inset-0 bg-amber-50 dark:bg-amber-950 opacity-10"></div>
                        )}

                        {/* Radial gradient overlay for hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 dark:from-white/0 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : null}{" "}
                    {/* Explicitly render null for empty cells */}
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

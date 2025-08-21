import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { trackUndoLastDraw } from "../../utils/analytics"; // Import analytics function
import BaseButton from "../BaseButton";
import { useConfirmation } from "../../hooks/useConfirmation";
import BaseConfirmationDialog from "../BaseConfirmationDialog";
import { useEffect, useState, useRef } from "react";
import { neapolitanNames } from "../../data/neapolitanNames";
import { FaPlus, FaUndoAlt, FaSyncAlt, FaArrowLeft } from "react-icons/fa"; // Import icons

/**
 * GameControls component props
 */
interface GameControlsProps {
  /** Function to call when reset is confirmed */
  onReset: () => void;
  /** Function to call when return to start page is confirmed */
  onReturnToStartPage?: () => void;
}

/**
 * Main game control panel with a modern, focus-oriented UX design
 * Emphasizes the primary draw action while keeping secondary actions accessible
 */
const GameControls = ({ onReset, onReturnToStartPage }: GameControlsProps) => {
  const drawNumber = useGameStore((state) => state.drawNumber);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);
  const resetGame = useGameStore((state) => state.resetGame);
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  // For accessibility announcements
  const [drawnNumberAnnouncement, setDrawnNumberAnnouncement] = useState("");
  const prevDrawnNumbersLength = useRef(drawnNumbers.length);

  // Announce when a new number is drawn
  useEffect(() => {
    if (
      drawnNumbers.length === 0 ||
      drawnNumbers.length <= prevDrawnNumbersLength.current
    ) {
      prevDrawnNumbersLength.current = drawnNumbers.length;
      return;
    }

    const lastDrawn = drawnNumbers[drawnNumbers.length - 1];
    const announcement = `${t.drawn}: ${lastDrawn}, ${neapolitanNames[lastDrawn]}`;
    setDrawnNumberAnnouncement(announcement);

    // Clear the announcement after a delay
    const timer = setTimeout(() => {
      setDrawnNumberAnnouncement("");
    }, 3000);

    prevDrawnNumbersLength.current = drawnNumbers.length;
    return () => clearTimeout(timer);
  }, [drawnNumbers, t]);

  // Remaining numbers calculation
  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawnNumbers.includes(num),
  );
  const hasDrawnNumbers = drawnNumbers.length > 0;

  // Use custom hooks for confirmation dialogs
  const undoConfirmation = useConfirmation(() => {
    trackUndoLastDraw(); // Track the undo event
    undoLastDraw(); // Call the original undo function
  });
  const resetConfirmation = useConfirmation(() => {
    // Note: Reset tracking is handled in App.tsx where resetGame is called directly
    // No need to track here as well.
    resetGame();
    if (onReset) onReset();
  });
  const returnConfirmation = useConfirmation(() => {
    if (onReturnToStartPage) onReturnToStartPage();
  });

  return (
    <div className="h-full grid grid-cols-[1fr_auto] gap-4 items-center">
      <div className="flex justify-center relative">
        {/* ARIA live region for announcing drawn numbers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {drawnNumberAnnouncement}
        </div>
        <BaseButton
          onClick={drawNumber}
          disabled={remainingNumbers.length === 0}
          variant="primary" // Keep variant for potential base styles, but override background
          size="lg"
          className="h-14 w-32 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 dark:from-red-700 dark:to-red-900 dark:hover:from-red-800 dark:hover:to-red-950 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] px-6 flex items-center justify-center" // Added flex centering
          aria-label={t.draw}
          leftIcon={<FaPlus className="h-5 w-5" />}
        >
          {t.draw}
        </BaseButton>
      </div>

      {/* Vertically stacked action buttons */}
      <div className="flex flex-col gap-2 w-36">
        {/* Undo button - enabled only if there are drawn numbers */}
        <BaseButton
          onClick={hasDrawnNumbers ? undoConfirmation.open : undefined}
          disabled={!hasDrawnNumbers}
          variant="secondary"
          size="sm"
          className={`flex justify-start items-center py-2 px-3 transition-all duration-200 ${hasDrawnNumbers ? "hover:bg-red-100 dark:hover:bg-red-900/40" : "opacity-60 cursor-not-allowed"}`}
          aria-label={t.undoLastDraw}
          leftIcon={<FaUndoAlt className="h-4 w-4" />}
        >
          {t.undoLastDraw}
        </BaseButton>

        {/* Reset button */}
        <BaseButton
          onClick={resetConfirmation.open}
          variant="danger"
          size="sm"
          className="flex justify-start items-center py-2 px-3 hover:bg-red-200 dark:hover:bg-red-800/40 transition-all duration-200"
          aria-label={t.reset}
          leftIcon={<FaSyncAlt className="h-4 w-4" />}
        >
          {t.reset}
        </BaseButton>

        {/* Back button - only shown if onReturnToStartPage is provided */}
        {onReturnToStartPage && (
          <BaseButton
            onClick={returnConfirmation.open}
            variant="secondary"
            size="sm"
            className="flex justify-start items-center py-2 px-3 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200"
            aria-label={t.back}
            leftIcon={<FaArrowLeft className="h-4 w-4" />}
          >
            {t.back}
          </BaseButton>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <BaseConfirmationDialog
        isOpen={undoConfirmation.isOpen}
        onClose={undoConfirmation.close}
        onConfirm={undoConfirmation.confirm}
        title={`${t.confirm} ${t.undoLastDraw}`}
        message={t.undoConfirmMessage}
        confirmText={t.undoLastDraw}
        cancelText={t.cancel}
      />

      <BaseConfirmationDialog
        isOpen={resetConfirmation.isOpen}
        onClose={resetConfirmation.close}
        onConfirm={resetConfirmation.confirm}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset}
        cancelText={t.cancel}
        confirmVariant="danger"
      />

      {onReturnToStartPage && (
        <BaseConfirmationDialog
          isOpen={returnConfirmation.isOpen}
          onClose={returnConfirmation.close}
          onConfirm={returnConfirmation.confirm}
          title={t.confirmAction}
          message={`${t.returnConfirmation} ${t.progressLost}`}
          confirmText={t.confirm}
          cancelText={t.cancel}
        />
      )}
    </div>
  );
};

export default GameControls;

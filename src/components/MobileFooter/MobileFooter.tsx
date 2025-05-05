import { useState, useCallback, useMemo } from "react"; // Added useMemo
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import ConfirmationDialog from "../ConfirmationDialog";
import LastDrawsModal from "../LastDrawsModal";
import BaseIconButton from "../BaseIconButton";
import {
  FaUndoAlt,
  FaSyncAlt,
  FaHome,
  FaHistory,
  FaMapMarkerAlt,
} from "react-icons/fa"; // Added FaHistory, FaMapMarkerAlt
import { neapolitanNames } from "../../data/neapolitanNames"; // Added neapolitanNames

/**
 * Mobile footer component for Tabellone mode with enhanced controls.
 * Only visible on small screens (below md breakpoint).
 */
type MobileFooterProps = {
  onReset: () => void;
  onReturnToStartPage?: () => void;
  onScrollRequest: (number: number) => void;
};

/**
 * Mobile footer with game controls for small screens
 */
const MobileFooter = ({
  onReset,
  onReturnToStartPage,
  onScrollRequest,
}: MobileFooterProps) => {
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const drawNumber = useGameStore((state) => state.drawNumber);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);
  const resetGame = useGameStore((state) => state.resetGame);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  const lastDrawnNumber = useMemo(
    () =>
      drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null,
    [drawnNumbers],
  );

  const lastDrawnName = useMemo(() => {
    if (lastDrawnNumber === null) return "-";
    return neapolitanNames[lastDrawnNumber] || "-";
  }, [lastDrawnNumber]);

  // State for confirmation dialogs
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isLastDrawsModalOpen, setIsLastDrawsModalOpen] = useState(false);

  const handleOpenUndoDialog = () => setIsUndoDialogOpen(true);
  const handleCloseUndoDialog = () => setIsUndoDialogOpen(false);
  const handleOpenResetDialog = () => setIsResetDialogOpen(true);
  const handleCloseResetDialog = () => setIsResetDialogOpen(false);
  const handleOpenReturnDialog = () => setIsReturnDialogOpen(true);
  const handleCloseReturnDialog = () => setIsReturnDialogOpen(false);
  const handleOpenLastDrawsModal = useCallback(
    () => setIsLastDrawsModalOpen(true),
    [],
  );
  const handleCloseLastDrawsModal = useCallback(
    () => setIsLastDrawsModalOpen(false),
    [],
  );

  // Connect internal handler to the prop passed from App.tsx
  const handleScrollToNumber = useCallback(
    (number: number | null) => {
      // Allow null
      if (number !== null) {
        onScrollRequest(number);
      }
    },
    [onScrollRequest],
  );

  const handleResetConfirm = () => {
    resetGame();
    onReset();
  };

  const handleReturnConfirm = () => {
    if (onReturnToStartPage) {
      onReturnToStartPage();
    }
    handleCloseReturnDialog(); // Close dialog after confirmation
  };

  const handleUndoConfirmed = () => {
    undoLastDraw();
    handleCloseUndoDialog(); // Close dialog after confirmation
  };

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawnNumbers.includes(num),
  );

  return (
    <>
      {/* Main footer container - uses flex-col */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-orange-100 dark:bg-orange-900 backdrop-blur-sm border-t border-orange-200 dark:border-orange-800 shadow-lg px-2 py-1.5 z-40 flex flex-col gap-1.5">
        {" "}
        {/* Added gap */}
        {/* Top Row: Last Draw Info (Left) & Estrai Button (Right) */}
        <div className="flex justify-between items-center w-full px-1">
          {/* Last Drawn Info */}
          <div className="flex flex-col items-start overflow-hidden mr-2">
            <span className="text-xs font-medium text-red-700 dark:text-red-400 leading-tight">
              {t.lastDraws}:
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-red-800 dark:text-red-300 leading-none truncate">
                {lastDrawnNumber ?? "-"}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 leading-none truncate">
                {lastDrawnName}
              </span>
            </div>
          </div>

          {/* Estrai Button (Top Right, Larger) */}
          <BaseIconButton
            onClick={drawNumber}
            disabled={remainingNumbers.length === 0}
            aria-label={t.draw}
            // Increased size (padding, text), added scale for ~1.3x feel
            className="min-h-[48px] px-6 py-2.5 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 dark:from-red-700 dark:to-red-900 dark:hover:from-red-800 dark:hover:to-red-950 text-white rounded-xl text-lg font-semibold disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center transform scale-105"
            icon={<span className="relative">{t.draw}</span>}
          />
        </div>
        {/* Bottom Row: Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1 w-full border-t border-orange-200/50 dark:border-orange-800/30">
          {/* Left Icon Group (Ultime 3, Scroll) */}
          <div className="flex items-center gap-1">
            {/* History Button ("Ultime 3") */}
            <BaseIconButton
              onClick={handleOpenLastDrawsModal}
              aria-label={t.historyLast3}
              label={t.historyLast3} // Add visible label
              disabled={drawnNumbers.length === 0}
              className="h-10 px-2 py-1 text-xs flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200"
              size="sm"
              icon={<FaHistory className="h-4 w-4" />}
            />
            {/* Locate/Scroll Button */}
            <BaseIconButton
              onClick={() => handleScrollToNumber(lastDrawnNumber)}
              aria-label={t.goToCard}
              label={t.goToCard} // Add visible label
              disabled={lastDrawnNumber === null}
              className="h-10 px-2 py-1 text-xs flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200"
              size="sm"
              icon={<FaMapMarkerAlt className="h-4 w-4" />}
            />
          </div>

          {/* Right Icon Group (Undo, Reset, Back) */}
          <div className="flex items-center gap-1">
            {/* Undo Button */}
            <BaseIconButton
              onClick={handleOpenUndoDialog}
              aria-label={t.undoLastDraw}
              disabled={drawnNumbers.length === 0}
              className="h-10 w-10 p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200 flex items-center justify-center"
              icon={<FaUndoAlt className="h-5 w-5" />}
            />

            {/* Reset Button */}
            <BaseIconButton
              onClick={handleOpenResetDialog}
              aria-label={t.reset}
              className="h-10 w-10 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 active:scale-95 transition-all duration-200 flex items-center justify-center"
              variant="danger"
              icon={<FaSyncAlt className="h-5 w-5" />}
            />

            {/* Back Button */}
            {onReturnToStartPage && (
              <BaseIconButton
                onClick={handleOpenReturnDialog}
                aria-label={t.returnToStartPage}
                className="h-10 w-10 p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200 flex items-center justify-center"
                icon={<FaHome className="h-5 w-5" />}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LastDrawsModal
        isOpen={isLastDrawsModalOpen}
        onClose={handleCloseLastDrawsModal}
      />

      <ConfirmationDialog
        isOpen={isUndoDialogOpen}
        onClose={handleCloseUndoDialog}
        onConfirm={handleUndoConfirmed} // Use correct handler
        title={`${t.confirm} ${t.undoLastDraw}`}
        message={t.undoConfirmMessage}
        confirmText={t.undoLastDraw} // Use specific text for confirm button
        cancelText={t.cancel}
      />

      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={handleCloseResetDialog}
        onConfirm={handleResetConfirm}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset} // Use specific text for confirm button
        cancelText={t.cancel}
      />

      {onReturnToStartPage && (
        <ConfirmationDialog
          isOpen={isReturnDialogOpen}
          onClose={handleCloseReturnDialog}
          onConfirm={handleReturnConfirm}
          title={t.confirmAction}
          message={`${t.returnConfirmation} ${t.progressLost}`}
          confirmText={t.confirm}
          cancelText={t.cancel}
        />
      )}
    </>
  );
};

export default MobileFooter;

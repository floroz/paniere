import { useState, useCallback } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import ConfirmationDialog from "../ConfirmationDialog";
import LastDrawsModal from "../LastDrawsModal";
import { LastDrawMobile } from "../LastDrawMobile/LastDrawMobile";
import BaseIconButton from "../BaseIconButton";
import { FaUndoAlt, FaSyncAlt, FaHome } from "react-icons/fa";

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
    (number: number) => {
      onScrollRequest(number);
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
  };

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawnNumbers.includes(num),
  );

  return (
    <>
      {/* Main footer container - uses flex-col */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-50/90 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-sm border-t border-amber-100 dark:border-gray-700 shadow-lg px-2 py-1.5 z-40 flex flex-col">
        {/* Top Row: Last Draw Info */}
        <LastDrawMobile
          onShowLast3Click={handleOpenLastDrawsModal}
          onScrollToNumberClick={handleScrollToNumber}
        />

        {/* Bottom Row: Action Buttons - Draw on Left, Icons on Right */}
        <div className="flex items-center justify-between gap-2 pt-1.5 w-full">
          {/* Draw Button (Prominent, Left) */}
          <BaseIconButton
            onClick={drawNumber}
            disabled={remainingNumbers.length === 0}
            aria-label={t.draw}
            // Applying StartPage primary button theme (amber gradient) & ensuring min height
            className="min-h-[44px] px-5 py-2 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 dark:from-amber-600 dark:to-amber-800 dark:hover:from-amber-700 dark:hover:to-amber-900 text-white rounded-xl text-base font-semibold disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center" // Added flex centering
            icon={<span className="relative">{t.draw}</span>}
            // size prop might conflict with explicit height/padding, consider removing if BaseIconButton internal padding is sufficient
          />

          {/* Group Undo, Reset, Back (Pushed Right) */}
          <div className="flex items-center gap-2">
            {/* Undo Button */}
            <BaseIconButton
              onClick={handleOpenUndoDialog}
              aria-label={t.undoLastDraw}
              disabled={drawnNumbers.length === 0}
              className="h-11 w-11 p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200 flex items-center justify-center" // Use h-11 (44px) and flex centering
              icon={<FaUndoAlt className="h-5 w-5" />}
            />

            {/* Reset Button */}
            <BaseIconButton
              onClick={handleOpenResetDialog}
              aria-label={t.reset}
              className="h-11 w-11 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 active:scale-95 transition-all duration-200 flex items-center justify-center" // Use h-11 (44px) and flex centering
              variant="danger" // Use danger variant styling
              icon={<FaSyncAlt className="h-5 w-5" />}
            />

            {/* Back Button */}
            {onReturnToStartPage && (
              <BaseIconButton
                onClick={handleOpenReturnDialog}
                aria-label={t.returnToStartPage}
                className="h-11 w-11 p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200 flex items-center justify-center" // Use h-11 (44px) and flex centering
                icon={<FaHome className="h-5 w-5" />}
              />
            )}
          </div>
        </div>
      </div>

      {/* Render Modals outside the main footer div but within the fragment */}
      <LastDrawsModal
        isOpen={isLastDrawsModalOpen}
        onClose={handleCloseLastDrawsModal}
      />

      <ConfirmationDialog
        isOpen={isUndoDialogOpen}
        onClose={handleCloseUndoDialog}
        onConfirm={undoLastDraw}
        title={`${t.confirm} ${t.undoLastDraw}`}
        message={t.undoConfirmMessage}
        confirmText={t.undoLastDraw}
        cancelText={t.cancel}
      />

      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={handleCloseResetDialog}
        onConfirm={handleResetConfirm}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset}
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

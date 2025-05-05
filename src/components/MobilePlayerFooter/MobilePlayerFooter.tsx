import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import ConfirmationDialog from "../ConfirmationDialog";
import BaseIconButton from "../BaseIconButton";
import { FaUndoAlt, FaHome } from "react-icons/fa";

/**
 * Props for the MobilePlayerFooter component
 */
interface MobilePlayerFooterProps {
  onReturnToStartPage?: () => void;
}

/**
 * Mobile footer for Player mode with Undo and Return controls.
 * Only visible on small screens (below md breakpoint).
 */
const MobilePlayerFooter = ({
  onReturnToStartPage,
}: MobilePlayerFooterProps) => {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);
  const undoLastNumber = useGameStore((state) => state.undoLastNumber);
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);

  // State for confirmation dialogs
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);

  const handleOpenReturnDialog = () => setIsReturnDialogOpen(true);
  const handleCloseReturnDialog = () => setIsReturnDialogOpen(false);
  const handleOpenUndoDialog = () => setIsUndoDialogOpen(true);
  const handleCloseUndoDialog = () => setIsUndoDialogOpen(false);

  const handleReturnConfirm = () => {
    if (onReturnToStartPage) {
      onReturnToStartPage();
    }
    handleCloseReturnDialog();
  };

  const handleUndoConfirm = () => {
    undoLastNumber();
    handleCloseUndoDialog();
  };

  return (
    <>
      {/* Fixed footer container for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-50/90 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-sm border-t border-amber-100 dark:border-gray-700 shadow-lg px-3 py-2 z-40 flex items-center justify-end gap-2">
        {/* Undo Button */}
        <BaseIconButton
          onClick={handleOpenUndoDialog}
          aria-label={t.undoLastDraw}
          disabled={drawnNumbers.length === 0}
          className="h-11 w-11 p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200 flex items-center justify-center"
          icon={<FaUndoAlt className="h-5 w-5" />}
        />

        {/* Back Button */}
        {onReturnToStartPage && (
          <BaseIconButton
            onClick={handleOpenReturnDialog}
            aria-label={t.returnToStartPage}
            className="h-11 w-11 p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200 flex items-center justify-center"
            icon={<FaHome className="h-5 w-5" />}
          />
        )}
      </div>

      {/* Confirmation Dialogs */}
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
      <ConfirmationDialog
        isOpen={isUndoDialogOpen}
        onClose={handleCloseUndoDialog}
        onConfirm={handleUndoConfirm}
        title={t.confirmAction}
        message={t.undoConfirmMessage}
        confirmText={t.confirm}
        cancelText={t.cancel}
      />
    </>
  );
};

export default MobilePlayerFooter;

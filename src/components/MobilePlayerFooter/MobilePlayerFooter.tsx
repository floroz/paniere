import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import ConfirmationDialog from "../ConfirmationDialog";
import BaseIconButton from "../BaseIconButton";
import { FaUndoAlt, FaHome } from "react-icons/fa";
import LastDrawsModal from "../LastDrawsModal";
import ManualMarkInput from "../ManualMarkInput/ManualMarkInput";

/**
 * Props for the MobilePlayerFooter component
 */
interface MobilePlayerFooterProps {
  onReturnToStartPage?: () => void;
}

/**
 * Mobile footer for Player mode with Undo, Return, and Paniere controls.
 * Only visible on small screens (below md breakpoint).
 */
const MobilePlayerFooter = ({
  onReturnToStartPage,
}: MobilePlayerFooterProps) => {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);
  const undoLastNumber = useGameStore((state) => state.undoLastNumber);
  const drawnNumbers = useGameStore((state) => state.drawnNumbers); // Keep for disabling Undo button

  // State for confirmation dialogs and Paniere modal
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);
  const [isPaniereModalOpen, setIsPaniereModalOpen] = useState(false);

  const handleOpenReturnDialog = () => setIsReturnDialogOpen(true);
  const handleCloseReturnDialog = () => setIsReturnDialogOpen(false);
  const handleOpenUndoDialog = () => setIsUndoDialogOpen(true);
  const handleCloseUndoDialog = () => setIsUndoDialogOpen(false);
  const handleClosePaniereModal = () => setIsPaniereModalOpen(false);

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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-orange-100 dark:bg-orange-900 backdrop-blur-sm border-t border-orange-200 dark:border-orange-800 shadow-lg px-3 py-2 z-40 flex items-center justify-between gap-3">
        {/* Paniere Image (Left) */}
        <div className="flex-shrink-0">
          <img
            src="/images/paniere.png"
            alt=""
            className="h-12 w-12 object-contain"
            aria-hidden="true"
          />
        </div>

        {/* Manual Mark Input & Button (Center) */}
        <div className="flex-grow flex items-center justify-center">
          <ManualMarkInput />
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Undo Button */}
          <BaseIconButton
            onClick={handleOpenUndoDialog}
            aria-label={t.undoLastDraw}
            disabled={drawnNumbers.length === 0}
            // Changed background/hover colors
            className="h-11 w-11 p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200 flex items-center justify-center"
            icon={<FaUndoAlt className="h-5 w-5" />}
          />

          {/* Back Button */}
          {onReturnToStartPage && (
            <BaseIconButton
              onClick={handleOpenReturnDialog}
              aria-label={t.returnToStartPage}
              className="h-11 w-11 p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200 flex items-center justify-center"
              icon={<FaHome className="h-5 w-5" />}
            />
          )}
        </div>
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

      {/* Paniere/Last Draws Modal */}
      <LastDrawsModal
        isOpen={isPaniereModalOpen}
        onClose={handleClosePaniereModal}
        // drawnNumbers prop is not needed here
      />
    </>
  );
};

export default MobilePlayerFooter;

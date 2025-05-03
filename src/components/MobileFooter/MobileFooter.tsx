import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import ConfirmationDialog from '../ConfirmationDialog';

/**
 * Mobile footer component that displays game controls and last drawn number
 * Only visible on small screens (below sm breakpoint)
 */
type MobileFooterProps = {
  onOpenLastDraws: () => void;
  onReset: () => void;
};

export default function MobileFooter({ onOpenLastDraws, onReset }: MobileFooterProps) {
  const drawn = useGameStore((state) => state.drawn);
  const lastDrawn = drawn[drawn.length - 1];
  const drawNumber = useGameStore((state) => state.drawNumber);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);
  const resetGame = useGameStore((state) => state.resetGame);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);
  
  // State for confirmation dialogs
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Handlers for dialog actions
  const handleOpenUndoDialog = () => setIsUndoDialogOpen(true);
  const handleCloseUndoDialog = () => setIsUndoDialogOpen(false);
  const handleOpenResetDialog = () => setIsResetDialogOpen(true);
  const handleCloseResetDialog = () => setIsResetDialogOpen(false);

  const onResetHandler = () => {
    resetGame();
    onReset();
  };
  
  // Calculate remaining numbers
  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawn.includes(num)
  );
  
  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-3 z-40">
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-1">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">{t.remaining}: {remainingNumbers.length}</div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={drawNumber}
                disabled={remainingNumbers.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-base font-medium disabled:opacity-50 hover:bg-blue-600"
                aria-label={t.draw}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && remainingNumbers.length > 0 && drawNumber()}
              >
                {t.draw}
              </button>
              <div className="flex space-x-1">
                <button 
                  onClick={handleOpenUndoDialog}
                  className="px-2 py-1.5 bg-gray-500 text-white rounded-md text-xs"
                  aria-label={t.undo}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenUndoDialog()}
                >
                  {t.undo}
                </button>
                <button 
                  onClick={handleOpenResetDialog}
                  className="px-2 py-1.5 bg-red-500 text-white rounded-md text-xs"
                  aria-label={t.reset}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenResetDialog()}
                >
                  {t.reset}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastDrawn && (
              <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900 px-2 py-1 rounded-md">
                <span className="text-xs text-amber-700 dark:text-amber-300 mr-1">
                  {t.last}:
                </span>
                <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
                  {lastDrawn}
                </span>
              </div>
            )}
            
            <button
              onClick={onOpenLastDraws}
              className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm"
              aria-label={`${t.lastDraws} 3`}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onOpenLastDraws()}
            >
              {t.last} 3
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmationDialog
        isOpen={isUndoDialogOpen}
        onClose={handleCloseUndoDialog}
        onConfirm={undoLastDraw}
        title={`${t.confirm} ${t.undo}`}
        message={t.undoConfirmMessage}
        confirmText={t.undo}
        cancelText={t.cancel}
      />
      
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={handleCloseResetDialog}
        onConfirm={onResetHandler}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset}
        cancelText={t.cancel}
      />
    </>
  );
}
